-- ===========================================================================
-- Shared Media layer + roles (Ticket 4; spec #2 Blogs/CMS — Media portion)
-- ===========================================================================
--
-- Establishes:
--   1. public.profiles — the `role` column (admin | editor), auto-created for
--      every auth user, with no role until an admin assigns one.
--   2. public.current_user_role() — the single role lookup used by every RLS
--      policy. Never JWT claims (spec #2).
--   3. public.media — the shared Media entity.
--   4. RLS: public read; media management for admin/editor; delete admin-only.
--   5. A guard so a Media record referenced by a Post cannot be deleted.
--   6. Storage RLS for the six media buckets.
--
-- Idempotent: safe to re-run. Apply with:
--   npx supabase db query --linked --file supabase/migrations/20260924000000_media_layer.sql
-- (or `supabase migration up` on a tracked project).

-- ---------------------------------------------------------------------------
-- 1. Profiles + roles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Every new auth user gets a profile with no role. Access is granted only when
-- an admin assigns a role; public signup therefore confers no privileges.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The role lookup. SECURITY DEFINER so it can read profiles from inside the
-- profiles RLS policy without recursing.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to anon, authenticated;

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin"
  on public.profiles for select
  using (id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "profiles admin manage" on public.profiles;
create policy "profiles admin manage"
  on public.profiles for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- 2. Media entity
-- ---------------------------------------------------------------------------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  storage_path text not null,
  type text not null check (type in ('image', 'video', 'document')),
  mime_type text,
  alt text,
  caption text,
  pattern_code text,
  category_slug text references public.categories (slug) on delete set null,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (bucket, storage_path)
);

-- Bucket allow-list (the six provisioned buckets).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'media_bucket_check'
  ) then
    alter table public.media add constraint media_bucket_check
      check (bucket in (
        'product-images', 'blog-images', 'gallery',
        'testing-videos', 'machine-images', 'catalogue-pdfs'
      ));
  end if;
end $$;

create index if not exists media_bucket_idx on public.media (bucket);
create index if not exists media_created_at_idx on public.media (created_at desc);
create index if not exists media_pattern_code_idx on public.media (pattern_code);
create index if not exists media_category_slug_idx on public.media (category_slug);
create index if not exists media_uploaded_by_idx on public.media (uploaded_by);

grant select on public.media to anon, authenticated;
grant insert, update, delete on public.media to authenticated;
grant select, update on public.profiles to authenticated;

alter table public.media enable row level security;

drop policy if exists "media public read" on public.media;
create policy "media public read"
  on public.media for select
  using (true);

drop policy if exists "media manager insert" on public.media;
create policy "media manager insert"
  on public.media for insert
  with check (
    public.current_user_role() in ('admin', 'editor')
    and uploaded_by = auth.uid()
  );

drop policy if exists "media manager update" on public.media;
create policy "media manager update"
  on public.media for update
  using (public.current_user_role() in ('admin', 'editor'))
  with check (public.current_user_role() in ('admin', 'editor'));

-- Deletion is admin-only (spec #2, user story 16).
drop policy if exists "media admin delete" on public.media;
create policy "media admin delete"
  on public.media for delete
  using (public.current_user_role() = 'admin');

-- ---------------------------------------------------------------------------
-- 3. Reference protection: block deletion while a Post references the media
-- ---------------------------------------------------------------------------
-- The `posts` table belongs to Ticket 9 (#19) and does not exist yet, so the
-- check is guarded with to_regclass and returns "not referenced" until it
-- lands.
--
-- ADR conflict to resolve in Ticket 9: ADR-0005 stores a Post body as a
-- structured JSON block model, so the correct reference check is an exact test
-- against the image-reference block (e.g. body @> '[{"type":"image", ...}]'),
-- not this substring scan. Until the block shape exists, the scan is a
-- forward-compatible placeholder; Ticket 9 must replace it and keep the Post
-- columns in sync with this function.
create or replace function public.media_is_referenced(p_media_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  refs integer := 0;
begin
  if to_regclass('public.posts') is not null then
    execute
      'select count(*) from public.posts
        where thumbnail_media_id = $1 or body::text like $2'
      into refs
      using p_media_id, '%' || p_media_id::text || '%';
  end if;
  return refs > 0;
end;
$$;

-- List the references to a media record, for the admin UI. Returns no rows
-- until the `posts` table lands (Ticket 9).
create or replace function public.media_references(p_media_id uuid)
returns table (kind text, id uuid, label text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if to_regclass('public.posts') is not null then
    return query execute
      'select ''post''::text as kind, id,
              coalesce(title, id::text) as label
         from public.posts
        where thumbnail_media_id = $1 or body::text like $2'
      using p_media_id, '%' || p_media_id::text || '%';
  end if;
end;
$$;

revoke all on function public.media_references(uuid) from public;
grant execute on function public.media_references(uuid) to authenticated;

create or replace function public.media_block_referenced_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.media_is_referenced(old.id) then
    raise exception
      'Media % is still referenced by a Post and cannot be deleted', old.id
      using errcode = '23503';
  end if;
  return old;
end;
$$;

drop trigger if exists media_block_referenced_delete on public.media;
create trigger media_block_referenced_delete
  before delete on public.media
  for each row execute function public.media_block_referenced_delete();

-- ---------------------------------------------------------------------------
-- 4. Storage RLS for the six media buckets
-- ---------------------------------------------------------------------------
-- Public read; admin/editor may upload and replace; only admins may delete.
do $$
begin
  drop policy if exists "media buckets public read" on storage.objects;
  create policy "media buckets public read"
    on storage.objects for select
    using (bucket_id in (
      'product-images', 'blog-images', 'gallery',
      'testing-videos', 'machine-images', 'catalogue-pdfs'
    ));

  drop policy if exists "media buckets manager insert" on storage.objects;
  create policy "media buckets manager insert"
    on storage.objects for insert to authenticated
    with check (
      bucket_id in (
        'product-images', 'blog-images', 'gallery',
        'testing-videos', 'machine-images', 'catalogue-pdfs'
      )
      and public.current_user_role() in ('admin', 'editor')
    );

  drop policy if exists "media buckets manager update" on storage.objects;
  create policy "media buckets manager update"
    on storage.objects for update to authenticated
    using (
      bucket_id in (
        'product-images', 'blog-images', 'gallery',
        'testing-videos', 'machine-images', 'catalogue-pdfs'
      )
      and public.current_user_role() in ('admin', 'editor')
    )
    with check (
      bucket_id in (
        'product-images', 'blog-images', 'gallery',
        'testing-videos', 'machine-images', 'catalogue-pdfs'
      )
      and public.current_user_role() in ('admin', 'editor')
    );

  drop policy if exists "media buckets admin delete" on storage.objects;
  create policy "media buckets admin delete"
    on storage.objects for delete to authenticated
    using (
      bucket_id in (
        'product-images', 'blog-images', 'gallery',
        'testing-videos', 'machine-images', 'catalogue-pdfs'
      )
      and public.current_user_role() = 'admin'
    );
end $$;

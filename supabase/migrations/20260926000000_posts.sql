-- ===========================================================================
-- Posts (Ticket 9; spec #2 Blogs & CMS)
-- ===========================================================================
--
-- Establishes the Post entity and its two-role permission model, and replaces
-- the forward-compatible media reference scan with an exact block check now
-- that the Post body shape exists (ADR-0005).
--
--   Post fields: title, slug, author (plain text), excerpt (optional),
--   thumbnail (Media), body (structured block JSON), status (draft|published),
--   published_at.
--   Lifecycle: Draft → Published; unpublish returns a Post to Draft. No
--   scheduled/archived states. No taxonomy.
--
-- Idempotent: safe to re-run. Apply with:
--   npx supabase db query --linked --file supabase/migrations/20260926000000_posts.sql

-- ---------------------------------------------------------------------------
-- 1. Posts
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  author text not null,
  excerpt text,
  thumbnail_media_id uuid references public.media (id) on delete set null,
  body jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc);
create index if not exists posts_created_at_idx
  on public.posts (created_at desc);
create index if not exists posts_thumbnail_media_id_idx
  on public.posts (thumbnail_media_id);

grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;

alter table public.posts enable row level security;

-- Public read of published posts; admins/editors read everything (drafts too).
drop policy if exists "posts public read published" on public.posts;
create policy "posts public read published"
  on public.posts for select
  using (status = 'published');

drop policy if exists "posts manager read" on public.posts;
create policy "posts manager read"
  on public.posts for select
  using (public.current_user_role() in ('admin', 'editor'));

drop policy if exists "posts manager insert" on public.posts;
create policy "posts manager insert"
  on public.posts for insert
  with check (
    public.current_user_role() in ('admin', 'editor')
    and created_by = auth.uid()
  );

drop policy if exists "posts manager update" on public.posts;
create policy "posts manager update"
  on public.posts for update
  using (public.current_user_role() in ('admin', 'editor'))
  with check (public.current_user_role() in ('admin', 'editor'));

drop policy if exists "posts admin delete" on public.posts;
create policy "posts admin delete"
  on public.posts for delete
  using (public.current_user_role() = 'admin');

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Reference protection — exact block check (replaces the Ticket 4 scan)
-- ---------------------------------------------------------------------------
-- A Media record is referenced by a Post when it is the thumbnail or appears
-- in an image block (`{"type":"image","mediaId":"<uuid>"}`) anywhere in the
-- body. This is the exact test ADR-0005 calls for; the body is always a JSON
-- array of blocks (validated on write). The `posts` table exists by this point
-- in the migration, so no `to_regclass` guard is needed.
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
  select count(*) into refs
  from public.posts p
  where p.thumbnail_media_id = p_media_id
    or (
      jsonb_typeof(p.body) = 'array'
      and exists (
        select 1
        from jsonb_array_elements(p.body) as block
        where block->>'type' = 'image'
          and block->>'mediaId' = p_media_id::text
      )
    );
  return refs > 0;
end;
$$;

create or replace function public.media_references(p_media_id uuid)
returns table (kind text, id uuid, label text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return query
    select 'post'::text as kind, p.id, coalesce(p.title, p.id::text) as label
    from public.posts p
    where p.thumbnail_media_id = p_media_id
      or (
        jsonb_typeof(p.body) = 'array'
        and exists (
          select 1
          from jsonb_array_elements(p.body) as block
          where block->>'type' = 'image'
            and block->>'mediaId' = p_media_id::text
        )
      );
end;
$$;

revoke all on function public.media_references(uuid) from public;
grant execute on function public.media_references(uuid) to authenticated;

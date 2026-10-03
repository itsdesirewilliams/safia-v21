-- ===========================================================================
-- Three-role model: Admin / Operator / Copywriter + role-aware RLS
-- ===========================================================================
--
-- Replaces the original two-role model (admin/editor) with three explicit
-- roles. The role is stored on `public.profiles.role` and read through
-- `public.current_user_role()`; RLS (not the UI) is the authority.
--
--   admin      — everything, including user management
--   operator   — everything except user management (media, posts, themes)
--   copywriter — blog/posts only; may upload only to the `blog-images` bucket
--
-- Media table + storage buckets follow the same rule: admin/operator manage all
-- six buckets; copywriter may write only `blog-images`. Deletes are allowed for
-- admin/operator. This migration supersedes the editor-based media policies in
-- 20260924/25/27 and the admin-only site settings write policy.
--
-- Idempotent: safe to re-run.
--   npx supabase db query --linked --file supabase/migrations/20260929000000_roles_and_media_permissions.sql

-- ---------------------------------------------------------------------------
-- 1. Profiles: widen the role check to the three canonical roles
-- ---------------------------------------------------------------------------
do $$
declare
  c text;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
  loop
    execute format('alter table public.profiles drop constraint %I', c);
  end loop;
end $$;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'operator', 'copywriter'));

-- ---------------------------------------------------------------------------
-- 2. Media table: admin/operator full; copywriter only blog-images
-- ---------------------------------------------------------------------------
drop policy if exists "media manager insert" on public.media;
create policy "media manager insert"
  on public.media for insert
  with check (
    uploaded_by = auth.uid()
    and (
      public.current_user_role() in ('admin', 'operator')
      or (
        public.current_user_role() = 'copywriter'
        and bucket = 'blog-images'
      )
    )
  );

drop policy if exists "media manager update" on public.media;
create policy "media manager update"
  on public.media for update
  using (
    public.current_user_role() in ('admin', 'operator')
    or (
      public.current_user_role() = 'copywriter'
      and bucket = 'blog-images'
    )
  )
  with check (
    public.current_user_role() in ('admin', 'operator')
    or (
      public.current_user_role() = 'copywriter'
      and bucket = 'blog-images'
    )
  );

drop policy if exists "media admin delete" on public.media;
drop policy if exists "media manager delete" on public.media;
create policy "media manager delete"
  on public.media for delete
  using (public.current_user_role() in ('admin', 'operator'));

-- ---------------------------------------------------------------------------
-- 3. Storage objects: same rule across the six buckets
-- ---------------------------------------------------------------------------
drop policy if exists "media buckets manager insert" on storage.objects;
create policy "media buckets manager insert"
  on storage.objects for insert to authenticated
  with check (
    (
      public.current_user_role() in ('admin', 'operator')
      and bucket_id in (
        'product-images', 'blog-images', 'gallery',
        'testing-videos', 'machine-images', 'catalogue-pdfs'
      )
    )
    or (
      public.current_user_role() = 'copywriter'
      and bucket_id = 'blog-images'
    )
  );

drop policy if exists "media buckets manager update" on storage.objects;
create policy "media buckets manager update"
  on storage.objects for update to authenticated
  using (
    (
      public.current_user_role() in ('admin', 'operator')
      and bucket_id in (
        'product-images', 'blog-images', 'gallery',
        'testing-videos', 'machine-images', 'catalogue-pdfs'
      )
    )
    or (
      public.current_user_role() = 'copywriter'
      and bucket_id = 'blog-images'
    )
  )
  with check (
    (
      public.current_user_role() in ('admin', 'operator')
      and bucket_id in (
        'product-images', 'blog-images', 'gallery',
        'testing-videos', 'machine-images', 'catalogue-pdfs'
      )
    )
    or (
      public.current_user_role() = 'copywriter'
      and bucket_id = 'blog-images'
    )
  );

-- Retire the editor-era restricted-bucket policies; the policy above now
-- covers every bucket for admin/operator.
drop policy if exists "quality first buckets admin insert" on storage.objects;
drop policy if exists "quality first buckets admin update" on storage.objects;
drop policy if exists "restricted buckets admin insert" on storage.objects;
drop policy if exists "restricted buckets admin update" on storage.objects;

drop policy if exists "media buckets admin delete" on storage.objects;
drop policy if exists "media buckets manager delete" on storage.objects;
create policy "media buckets manager delete"
  on storage.objects for delete to authenticated
  using (
    public.current_user_role() in ('admin', 'operator')
    and bucket_id in (
      'product-images', 'blog-images', 'gallery',
      'testing-videos', 'machine-images', 'catalogue-pdfs'
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Posts: all three roles may read/write; admin/operator may delete
-- ---------------------------------------------------------------------------
drop policy if exists "posts manager read" on public.posts;
create policy "posts manager read"
  on public.posts for select
  using (public.current_user_role() in ('admin', 'operator', 'copywriter'));

drop policy if exists "posts manager insert" on public.posts;
create policy "posts manager insert"
  on public.posts for insert
  with check (
    public.current_user_role() in ('admin', 'operator', 'copywriter')
    and created_by = auth.uid()
  );

drop policy if exists "posts manager update" on public.posts;
create policy "posts manager update"
  on public.posts for update
  using (public.current_user_role() in ('admin', 'operator', 'copywriter'))
  with check (public.current_user_role() in ('admin', 'operator', 'copywriter'));

drop policy if exists "posts admin delete" on public.posts;
drop policy if exists "posts manager delete" on public.posts;
create policy "posts manager delete"
  on public.posts for delete
  using (public.current_user_role() in ('admin', 'operator'));

-- ---------------------------------------------------------------------------
-- 5. Site settings: admin/operator may write (theme switching)
-- ---------------------------------------------------------------------------
drop policy if exists "site settings are admin write" on public.site_settings;
create policy "site settings are manager write"
  on public.site_settings for all to authenticated
  using (public.current_user_role() in ('admin', 'operator'))
  with check (public.current_user_role() in ('admin', 'operator'));

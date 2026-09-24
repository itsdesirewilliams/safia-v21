-- ===========================================================================
-- Gallery: Admin-only media management (Ticket 11; spec #7)
-- ===========================================================================
--
-- Gallery media (the `gallery` bucket) is managed by Admins only — upload,
-- list/view, edit caption, edit alt, delete. Editors manage every other
-- non-restricted bucket. Enforced in RLS for both `public.media` and
-- `storage.objects`; the admin UI only hides controls as a convenience. This
-- mirrors the Quality First restriction (spec #3) without a second media table
-- or CMS.
--
-- Idempotent: safe to re-run. Apply with:
--   npx supabase db query --linked --file supabase/migrations/20260927000000_gallery_admin_only.sql
-- (or `supabase migration up` on a tracked project).

-- ---------------------------------------------------------------------------
-- 1. `gallery` is Admin-only in the media table
-- ---------------------------------------------------------------------------
drop policy if exists "media manager insert" on public.media;
create policy "media manager insert"
  on public.media for insert
  with check (
    uploaded_by = auth.uid()
    and (
      public.current_user_role() = 'admin'
      or (
        public.current_user_role() = 'editor'
        and bucket not in ('testing-videos', 'machine-images', 'gallery')
      )
    )
  );

drop policy if exists "media manager update" on public.media;
create policy "media manager update"
  on public.media for update
  using (
    public.current_user_role() = 'admin'
    or (
      public.current_user_role() = 'editor'
      and bucket not in ('testing-videos', 'machine-images', 'gallery')
    )
  )
  with check (
    public.current_user_role() = 'admin'
    or (
      public.current_user_role() = 'editor'
      and bucket not in ('testing-videos', 'machine-images', 'gallery')
    )
  );

-- ---------------------------------------------------------------------------
-- 2. `gallery` is Admin-only in storage
-- ---------------------------------------------------------------------------
-- Editors keep insert/update on the remaining buckets.
drop policy if exists "media buckets manager insert" on storage.objects;
create policy "media buckets manager insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('product-images', 'blog-images', 'catalogue-pdfs')
    and public.current_user_role() in ('admin', 'editor')
  );

drop policy if exists "media buckets manager update" on storage.objects;
create policy "media buckets manager update"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('product-images', 'blog-images', 'catalogue-pdfs')
    and public.current_user_role() in ('admin', 'editor')
  )
  with check (
    bucket_id in ('product-images', 'blog-images', 'catalogue-pdfs')
    and public.current_user_role() in ('admin', 'editor')
  );

-- The restricted buckets (Quality First + Gallery) are Admin-only. This
-- supersedes the Quality First policies by the same intent, under a name that
-- covers both restricted groups.
drop policy if exists "quality first buckets admin insert" on storage.objects;
drop policy if exists "restricted buckets admin insert" on storage.objects;
create policy "restricted buckets admin insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('testing-videos', 'machine-images', 'gallery')
    and public.current_user_role() = 'admin'
  );

drop policy if exists "quality first buckets admin update" on storage.objects;
drop policy if exists "restricted buckets admin update" on storage.objects;
create policy "restricted buckets admin update"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('testing-videos', 'machine-images', 'gallery')
    and public.current_user_role() = 'admin'
  )
  with check (
    bucket_id in ('testing-videos', 'machine-images', 'gallery')
    and public.current_user_role() = 'admin'
  );

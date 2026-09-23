-- ===========================================================================
-- Quality First: hide flag + Admin-only management (Ticket 5; spec #3)
-- ===========================================================================
--
-- Builds on the shared Media layer (Ticket 4, spec #2) without adding a second
-- media table, upload system or CMS:
--
--   1. `public.media.hidden` — a per-item hide flag. Presence is still the
--      source of truth for Quality First (ADR-0006); `hidden = true` removes an
--      item from the public page without deleting the file, enforced at
--      discovery time.
--   2. Quality First media management (`testing-videos`, `machine-images`) is
--      Admin-only. Editors may still manage every other bucket. Enforced in RLS
--      for both `public.media` and `storage.objects`; the UI only hides
--      controls as a convenience.
--
-- Idempotent: safe to re-run. Apply with:
--   npx supabase db query --linked --file supabase/migrations/20260925000000_quality_first_hide.sql
-- (or `supabase migration up` on a tracked project).

-- ---------------------------------------------------------------------------
-- 1. Hide flag
-- ---------------------------------------------------------------------------
alter table public.media
  add column if not exists hidden boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2. Quality First buckets are Admin-only in the media table
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
        and bucket not in ('testing-videos', 'machine-images')
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
      and bucket not in ('testing-videos', 'machine-images')
    )
  )
  with check (
    public.current_user_role() = 'admin'
    or (
      public.current_user_role() = 'editor'
      and bucket not in ('testing-videos', 'machine-images')
    )
  );

-- ---------------------------------------------------------------------------
-- 3. Quality First buckets are Admin-only in storage
-- ---------------------------------------------------------------------------
drop policy if exists "media buckets manager insert" on storage.objects;
create policy "media buckets manager insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in (
      'product-images', 'blog-images', 'gallery', 'catalogue-pdfs'
    )
    and public.current_user_role() in ('admin', 'editor')
  );

drop policy if exists "quality first buckets admin insert" on storage.objects;
create policy "quality first buckets admin insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('testing-videos', 'machine-images')
    and public.current_user_role() = 'admin'
  );

drop policy if exists "media buckets manager update" on storage.objects;
create policy "media buckets manager update"
  on storage.objects for update to authenticated
  using (
    bucket_id in (
      'product-images', 'blog-images', 'gallery', 'catalogue-pdfs'
    )
    and public.current_user_role() in ('admin', 'editor')
  )
  with check (
    bucket_id in (
      'product-images', 'blog-images', 'gallery', 'catalogue-pdfs'
    )
    and public.current_user_role() in ('admin', 'editor')
  );

drop policy if exists "quality first buckets admin update" on storage.objects;
create policy "quality first buckets admin update"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('testing-videos', 'machine-images')
    and public.current_user_role() = 'admin'
  )
  with check (
    bucket_id in ('testing-videos', 'machine-images')
    and public.current_user_role() = 'admin'
  );

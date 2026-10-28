-- Post SEO fields (Phase D).
--
-- Backward compatible: existing published posts and drafts keep working; the
-- public page falls back to the title/excerpt when these are blank. No RLS
-- change is needed because the columns live on public.posts and inherit the
-- table's existing policies.
--
-- Apply with (after approval):
--   npx supabase db query --linked --file supabase/migrations/20261026000000_post_seo.sql

alter table public.posts
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists og_media_id uuid references public.media (id) on delete set null;

comment on column public.posts.seo_title is
  'Optional search/social title; falls back to the post title when blank.';
comment on column public.posts.seo_description is
  'Optional search/social description; falls back to the excerpt when blank.';
create index if not exists posts_og_media_id_idx
  on public.posts (og_media_id);

comment on column public.posts.og_media_id is
  'Optional social-sharing image from the Media library; falls back to the thumbnail.';

-- Block editor support for blog posts.
--
-- Additive and backward compatible. The block body itself already lives in
-- `posts.body` (jsonb), so no body-table migration is needed. This adds the
-- optional category field and repeats the optional SEO columns idempotently so
-- this migration alone is sufficient on environments where
-- 20261026000000_post_seo.sql has not been applied.
--
-- Apply with (after review/approval):
--   npx supabase db query --linked --file supabase/migrations/20261029000000_post_editor.sql

alter table public.posts
  add column if not exists category text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists og_media_id uuid references public.media (id) on delete set null;

comment on column public.posts.category is
  'Optional catalogue category slug for the post (e.g. truck-bus, agriculture, otr).';
comment on column public.posts.seo_title is
  'Optional search/social title; falls back to the post title when blank.';
comment on column public.posts.seo_description is
  'Optional search/social description; falls back to the excerpt when blank.';
comment on column public.posts.og_media_id is
  'Optional social-sharing image from the Media library; falls back to the thumbnail.';

create index if not exists posts_category_idx
  on public.posts (category);
create index if not exists posts_og_media_id_idx
  on public.posts (og_media_id);

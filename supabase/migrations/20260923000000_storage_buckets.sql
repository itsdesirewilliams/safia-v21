-- Storage buckets for Safeway Tyre (spec #10 / #2).
--
-- Six buckets back the media-bearing domains. All are public-read because the
-- site is public; write access is governed by storage RLS policies owned by
-- the shared Media-layer ticket (Ticket 4). No object policies are defined
-- here yet, so only the service role can write until that ticket lands.

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('blog-images', 'blog-images', true),
  ('gallery', 'gallery', true),
  ('testing-videos', 'testing-videos', true),
  ('machine-images', 'machine-images', true),
  ('catalogue-pdfs', 'catalogue-pdfs', true)
on conflict (id) do update set public = excluded.public;

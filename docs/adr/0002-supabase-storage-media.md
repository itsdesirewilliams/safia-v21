# Supabase Storage as the single media system; Cloudflare Stream deferred

All website media (product images, blog images, gallery images, testing videos, catalogue PDFs) lives in Supabase Storage initially, with no separate video platform. The expected video library is small (a few hundred MB), so introducing a dedicated video CDN now would be premature. Cloudflare Stream remains an optional later optimization if video egress becomes a real cost.

## Considered Options

- **Cloudflare Stream / a dedicated video CDN from the start:** better video delivery, but adds a second media system to the CMS for no current need.
- **Supabase Storage only:** one media system, matching Auth and the database; acceptable for the expected small video collection.

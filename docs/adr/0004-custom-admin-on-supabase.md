# Custom Next.js admin on Supabase (no third-party headless CMS)

The Blogs/CMS is a custom admin built in the same Next.js app on Supabase, rather than a third-party headless CMS (Sanity, Contentful, Strapi, etc.). The data is already relational in Supabase (Postgres + Auth + Storage, per ADR-0001), and a headless CMS would add a second vendor and a duplicated content-authoring surface for no benefit at this scale.

## Considered Options

- **Third-party headless CMS (Sanity/Contentful/Strapi):** polished editor out of the box, but a second vendor, another schema to maintain, and a sync layer into Supabase.
- **Custom admin on Supabase:** one platform, one data model, admin shares the app's auth and storage; more UI to build but no integration surface.

# Next.js + Supabase as the platform

The Safeway Tyre website is rebuilt as a Next.js front end on Supabase (PostgreSQL for products, blogs, and media relations; Supabase Auth for the admin; Supabase Storage for all media). We chose a single hosted platform over a custom backend or mixing services because the catalogue data is relational and traffic is modest, so simplicity wins over a bespoke architecture.

## Considered Options

- **Custom backend (Next.js API routes + self-hosted Postgres):** more control, but more operational burden for a small team.
- **Firebase / another document-style BaaS:** document storage fits poorly with the strongly relational catalogue (Category → Pattern → Variant).
- **Supabase:** relational Postgres plus Auth and Storage in one vendor, matching the data model directly.

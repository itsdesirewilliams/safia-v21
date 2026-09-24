# Missing inputs

Ticket #11 requires that configuration is externalised and that values Safeway
has not supplied are **flagged, not invented**. This file tracks that list.

Every value below is read from the environment (see `.env.example`). The site
shell builds and runs without them; features that need them fail loudly with a
`ConfigError` naming exactly what is missing.

## Supplied and configured

| Input | Where it lives | Status |
| --- | --- | --- |
| Supabase URL | `NEXT_PUBLIC_SUPABASE_URL` | Supplied — project `safeway-tyre` (`ap-south-1`) |
| Supabase anon key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supplied |
| Supabase service-role key | `SUPABASE_SERVICE_ROLE_KEY` | Supplied (server-only) |
| Six storage buckets | `supabase/migrations/20260923000000_storage_buckets.sql` | Created |
| Company address | `NEXT_PUBLIC_COMPANY_ADDRESS` | Supplied — corporate office, Ludhiana |
| Instagram URL | `NEXT_PUBLIC_SOCIAL_INSTAGRAM` | Supplied |
| Facebook URL | `NEXT_PUBLIC_SOCIAL_FACEBOOK` | Supplied |
| LinkedIn URL | `NEXT_PUBLIC_SOCIAL_LINKEDIN` | Supplied |
| X (Twitter) URL | `NEXT_PUBLIC_SOCIAL_X` | Supplied |
| Pinterest URL | `NEXT_PUBLIC_SOCIAL_PINTEREST` | Supplied |
| Catalogue schema | `supabase/migrations/20260923010000_catalogue_minimal.sql` | Applied to `safeway-tyre` (homepage search) |
| Master product data | `supabase/master-product-data.json` | Supplied — the authoritative Category → Pattern → Variant dataset (schemaVersion 1.0) |
| Catalogue seed | `supabase/seed.sql` | Applied — generated from the master product data; Ticket 8 adds the full normalization seam |
| Media schema + roles | `supabase/migrations/20260924000000_media_layer.sql` | Applied — `media`, `profiles`, RLS, storage policies, reference guard |
| Homepage hero video | `NEXT_PUBLIC_HERO_VIDEO_URL` (fallback `/media/hero-tour.mp4`) | Interim placeholder — the supplied Manufacturing Unit Tour clip ships in `public/media`; replace when Safeway supplies a final hero video |

## Awaiting input (flagged, not invented)

| Input | Env var | Blocks | Notes |
| --- | --- | --- | --- |
| Instagram long-lived access token | `INSTAGRAM_ACCESS_TOKEN` | Homepage Instagram feed (ADR-0008) | Homepage renders a labelled placeholder when absent; a configured token whose fetch fails hides the section |
| YouTube video ID | `YOUTUBE_VIDEO_ID` | Homepage "Take a Tour" | Homepage renders a labelled placeholder when absent |
| Certification assets | — (asset) | Homepage / About Us | Not supplied; the homepage renders a labelled placeholder rather than inventing names or marks |
| Testimonial content | — (content) | Homepage | Not supplied; the homepage renders a labelled placeholder rather than inventing quotes |
| Product / category imagery | — (asset) | Homepage product ranges, Pattern pages | Not supplied; the homepage uses branded abstract tiles as clearly-temporary placeholders rather than stock or old-site imagery |
| Slider artwork | — (asset) | Catalogue & Business Profile sliders | Not supplied; labelled placeholder SVGs ship in `public/assets/{landscape,portrait}/{catalogue,business-profile}` and are replaced by dropping matching filenames into both ratio folders |
| Catalogue download URL | `NEXT_PUBLIC_CATALOGUE_DOWNLOAD_URL` | Catalogue download action | No PDF link supplied; `/catalogue` shows a labelled placeholder for the download action until one is set |
| Email transport credentials | `EMAIL_TRANSPORT_*` | Contact Us forms (ADR-0007) | Transport provider itself is a deferred implementation detail |
| First admin account | — (credential) | `/admin/media` access | No admin/editor user exists yet. Bootstrap with `ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/create-admin.mjs` (see `docs/admin-media.md`). Roles are never self-assigned |
| Quality First testing videos | — (asset) | `/quality-first` story rail | Not supplied; the rail renders a labelled empty state until `.mp4`/`.webm` files are added to `testing-videos/stories/` (Admin-only) |
| Quality First machine images | — (asset) | `/quality-first` machine gallery | Not supplied; the masonry renders a labelled empty state until images are added to the `machine-images` bucket (Admin-only) |
| Quality First hero footage | — (asset) | `/quality-first` hero | Not supplied; the hero uses a designed placeholder panel rather than old-site or stock media |
| Quality First process specifics | — (content) | `/quality-first` testing explanation | Specific standards, machine names, laboratory capabilities and certifications are not supplied; a labelled note stands in rather than inventing them (the surrounding copy is developer-owned) |
| Final display font | — (design decision) | Production typography | Inter is the active typeface (Anek Devanagari for Devanagari copy). Alfabet is removed; the supplied Fontspring demo cuts in `assets/fonts` must not be used in production |
| About Us team profiles | — (content) | `/about-us` Team section | No team-member data has been supplied; the Team section renders a labelled placeholder until profiles are added to `ABOUT_TEAM_MEMBERS` in `src/lib/about-us.ts` (no database or admin step) |
| Blog posts | — (content) | `/blogs`, `/blogs/<slug>` | No posts have been authored yet; the listing shows a labelled empty state until posts are published from `/admin/posts` |
| Rich-text editor library | — (design decision) | Blog authoring | The block body is edited with a simple developer-built editor (paragraph / heading / image). A rich-text library (TipTap, ProseMirror) is deferred and out of scope for spec #2 (ADR-0005 keeps the block model editor-agnostic) |

## How missing values behave

- Required server values throw a `ConfigError` that lists the missing variable
  names (see `src/lib/config.ts`). They never fall back to a default.
- Optional public values (social URLs, address) are omitted from the rendered
  page when unset, so the shell never displays invented content.
- `/api/health` reports `503` and `supabase: "unconfigured"` when Supabase
  configuration is absent.
- Homepage sections with an unsupplied input render a labelled placeholder
  rather than inventing content: the tour (no `YOUTUBE_VIDEO_ID`), the
  Instagram feed (no `INSTAGRAM_ACCESS_TOKEN`), certifications, testimonials
  and the map (no `NEXT_PUBLIC_COMPANY_ADDRESS`). A configured Instagram token
  whose fetch fails hides the section instead.
- The Contact Us Query and Feedback forms validate and rate-limit server-side;
  when `EMAIL_TRANSPORT_*` is unset they return a graceful WhatsApp/email
  fallback rather than silently dropping the submission. The same Query form is
  reused on the homepage.
- The Contact Us map renders only from the approved configured address; when
  `NEXT_PUBLIC_COMPANY_ADDRESS` is unset it shows a labelled placeholder.

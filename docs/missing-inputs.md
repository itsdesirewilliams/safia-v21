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
| Catalogue schema | `supabase/migrations/20260923010000_catalogue_minimal.sql` | Applied to `safeway-tyre` (homepage search) |
| Catalogue seed | `supabase/seed.sql` | Applied — **provisional**; Ticket 8 replaces it with the normalized dataset |

## Awaiting input (flagged, not invented)

| Input | Env var | Blocks | Notes |
| --- | --- | --- | --- |
| X (Twitter) profile URL | `NEXT_PUBLIC_SOCIAL_X` | Footer completeness | No X profile found on the live site; omitted from the footer until supplied |
| Pinterest profile URL | `NEXT_PUBLIC_SOCIAL_PINTEREST` | Footer completeness | No Pinterest profile found on the live site; omitted from the footer until supplied |
| Instagram long-lived access token | `INSTAGRAM_ACCESS_TOKEN` | Homepage Instagram feed (ADR-0008) | Homepage renders a labelled placeholder when absent; a configured token whose fetch fails hides the section |
| YouTube video ID | `YOUTUBE_VIDEO_ID` | Homepage "Take a Tour" | Homepage renders a labelled placeholder when absent |
| Certification assets | — (asset) | Homepage / About Us | Not supplied; the homepage renders a labelled placeholder rather than inventing names or marks |
| Testimonial content | — (content) | Homepage | Not supplied; the homepage renders a labelled placeholder rather than inventing quotes |
| Email transport credentials | `EMAIL_TRANSPORT_*` | Contact Us forms (ADR-0007) | Transport provider itself is a deferred implementation detail |
| Alfabet font licence | — (asset) | Production typography | `src/app/fonts` currently uses the Fontspring **demo** cuts supplied in `assets/fonts`; licence must be verified before production |

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
- The inquiry form validates and rate-limits server-side; when
  `EMAIL_TRANSPORT_*` is unset it returns a graceful WhatsApp/email fallback
  rather than silently dropping the submission.

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

## Awaiting input (flagged, not invented)

| Input | Env var | Blocks | Notes |
| --- | --- | --- | --- |
| X (Twitter) profile URL | `NEXT_PUBLIC_SOCIAL_X` | Footer completeness | No X profile found on the live site; omitted from the footer until supplied |
| Pinterest profile URL | `NEXT_PUBLIC_SOCIAL_PINTEREST` | Footer completeness | No Pinterest profile found on the live site; omitted from the footer until supplied |
| Instagram long-lived access token | `INSTAGRAM_ACCESS_TOKEN` | Homepage Instagram feed (ADR-0008) | Homepage must hide the feed gracefully if absent |
| YouTube video ID | `YOUTUBE_VIDEO_ID` | Homepage "See Safeway in Action" | No YouTube video found on the live site |
| Email transport credentials | `EMAIL_TRANSPORT_*` | Contact Us forms (ADR-0007) | Transport provider itself is a deferred implementation detail |
| Alfabet font licence | — (asset) | Production typography | `src/app/fonts` currently uses the Fontspring **demo** cuts supplied in `assets/fonts`; licence must be verified before production |
| Certification assets | — (asset) | Homepage / About Us | Referenced by the master document; not supplied |
| Testimonial content | — (content) | Homepage | Referenced by the master document; not supplied |

## How missing values behave

- Required server values throw a `ConfigError` that lists the missing variable
  names (see `src/lib/config.ts`). They never fall back to a default.
- Optional public values (social URLs, address) are omitted from the rendered
  page when unset, so the shell never displays invented content.
- `/api/health` reports `503` and `supabase: "unconfigured"` when Supabase
  configuration is absent.

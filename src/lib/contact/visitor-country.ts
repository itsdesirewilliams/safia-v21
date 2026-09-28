import { isCountryCode } from "./countries";

/**
 * Coarse, request-based visitor-country hints. These are set by hosting/CDN
 * platforms from the client IP and carry a two-letter country only — no
 * precise location. Browser geolocation is never requested.
 */
const COUNTRY_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
] as const;

/**
 * Resolve a supported ISO 3166-1 alpha-2 country from request headers, or
 * `null` when no trustworthy hint is present. The result is only ever used to
 * pre-select the phone field's country; it is not stored.
 */
export function countryFromHeaders(
  get: (name: string) => string | null | undefined,
): string | null {
  for (const name of COUNTRY_HEADERS) {
    const code = get(name)?.trim().toUpperCase();
    if (code && isCountryCode(code)) {
      return code;
    }
  }
  return null;
}

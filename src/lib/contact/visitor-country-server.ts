import { headers } from "next/headers";

import { countryFromHeaders } from "./visitor-country";

/**
 * Best-effort visitor country for the current request, from the hosting
 * platform's coarse IP-derived country header. Returns `null` when detection is
 * unavailable so callers can fall back safely. Nothing is persisted.
 */
export async function detectVisitorCountry(): Promise<string | null> {
  const headerList = await headers();
  return countryFromHeaders((name) => headerList.get(name));
}

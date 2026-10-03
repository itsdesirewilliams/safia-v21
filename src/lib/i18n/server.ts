import { cookies, headers } from "next/headers";
import { cache } from "react";

import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  type Locale,
} from "./config";
import { dictionaryFor, type Dictionary } from "./dictionaries";

/**
 * Server-side locale resolution.
 *
 * The locale is carried on the request by the proxy (a rewrite for `/es`, `/pt`
 * and `/ar` URLs), so server components render the right language without a
 * client round-trip. A `NEXT_LOCALE` cookie is only a hint for returning
 * visitors; it never overrides an explicit URL. The admin is always English.
 */
export { LOCALE_COOKIE, LOCALE_HEADER };

export const getLocale = cache(async (): Promise<Locale> => {
  const headerStore = await headers();
  const fromHeader = headerStore.get(LOCALE_HEADER);
  if (isLocale(fromHeader)) {
    return fromHeader;
  }

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) {
    return fromCookie;
  }

  return DEFAULT_LOCALE;
});

export const getDictionary = cache(async (): Promise<Dictionary> => {
  return dictionaryFor(await getLocale());
});

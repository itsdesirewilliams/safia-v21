import { cookies, headers } from "next/headers";
import { cache } from "react";

import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  type Locale,
} from "./config";
import {
  dictionaryFor,
  resolveLocale,
  type Dictionary,
} from "./dictionaries";

/**
 * Server-side locale resolution.
 *
 * The locale is carried on the request by the proxy (a rewrite for the
 * prefixed language URLs), so server components render the right language
 * without a client round-trip. A `NEXT_LOCALE` cookie is only a hint for
 * returning visitors; it never overrides an explicit URL. The admin is always
 * English.
 */
export { LOCALE_COOKIE, LOCALE_HEADER };

/** The locale the visitor asked for. */
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

/**
 * The locale that is actually rendered. It is the requested locale whenever
 * that language's dictionary is complete; an incomplete one falls back to
 * English so the header never advertises a language the page is not in.
 */
export const getActiveLocale = cache(async (): Promise<Locale> => {
  return resolveLocale(await getLocale());
});

export const getDictionary = cache(async (): Promise<Dictionary> => {
  return dictionaryFor(await getActiveLocale());
});

import {
  hreflang,
  LOCALES,
  localePrefix,
  stripLocalePrefix,
  type Locale,
} from "./config";

/**
 * Locale-aware URL helpers (client-safe). English maps to the canonical root
 * path; other locales are prefixed. `path` is always the English/canonical path
 * (e.g. `/products/agriculture`).
 */
export function localizedHref(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const prefix = localePrefix(locale);
  if (prefix === "") {
    return clean;
  }
  return clean === "/" ? prefix : `${prefix}${clean}`;
}

/** The href for the same page in another locale, from the current pathname. */
export function switchLocaleHref(locale: Locale, pathname: string): string {
  return localizedHref(locale, stripLocalePrefix(pathname));
}

/** `alternates.languages` for a canonical path, for Next metadata. */
export function languageAlternates(path: string): Record<string, string> {
  return Object.fromEntries(
    LOCALES.map((locale) => [hreflang(locale), localizedHref(locale, path)]),
  );
}

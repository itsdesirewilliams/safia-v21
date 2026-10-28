import {
  DEFAULT_LOCALE,
  hreflang,
  LOCALES,
  localePrefix,
  stripLocalePrefix,
  type Locale,
} from "./config";

/** Locale-aware URL helpers (client-safe). English maps to the canonical root
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

/**
 * `alternates.languages` for a canonical path, for Next metadata.
 *
 * English is the sensible `x-default` destination: it is the complete,
 * canonical version of every page.
 */
export function languageAlternates(path: string): Record<string, string> {
  const languages = Object.fromEntries(
    LOCALES.map((locale) => [hreflang(locale), localizedHref(locale, path)]),
  );
  languages["x-default"] = localizedHref(DEFAULT_LOCALE, path);
  return languages;
}

/**
 * Canonical + hreflang metadata for a path in the active locale.
 *
 * Indexable translated pages canonicalise to themselves (never to English) and
 * advertise every locale, so canonical and hreflang agree.
 */
export function localizedAlternates(
  locale: Locale,
  path: string,
): { canonical: string; languages: Record<string, string> } {
  return {
    canonical: localizedHref(locale, path),
    languages: languageAlternates(path),
  };
}

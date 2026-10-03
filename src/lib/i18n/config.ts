/**
 * Client-safe localization configuration: the supported public languages, their
 * labels, text direction and URL-prefix rules.
 *
 * English is the canonical language and lives at the existing root URLs
 * (`/about-us`, `/products/...`). Non-English languages are served under a
 * prefix (`/es/...`, `/pt/...`, `/ar/...`) so existing English links and SEO
 * never break. The admin is never localized.
 */
export const LOCALES = ["en", "es", "pt", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Request header the proxy sets so server components know the locale. */
export const LOCALE_HEADER = "x-safeway-locale";

/** Cookie that remembers a visitor's chosen language. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** The non-English locales that carry a URL prefix. */
export const PREFIXED_LOCALES = ["es", "pt", "ar"] as const;

export type PrefixedLocale = (typeof PREFIXED_LOCALES)[number];

export type LocaleMeta = {
  /** Full name in the language itself, shown inside the dropdown. */
  nativeName: string;
  /** Compact code shown in the closed header state. */
  short: string;
  dir: "ltr" | "rtl";
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { nativeName: "English", short: "EN", dir: "ltr" },
  es: { nativeName: "Español", short: "ES", dir: "ltr" },
  pt: { nativeName: "Português", short: "PT", dir: "ltr" },
  ar: { nativeName: "العربية", short: "AR", dir: "rtl" },
};

/** In dropdown order. */
export const LOCALE_ORDER: readonly Locale[] = ["en", "es", "pt", "ar"];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function localeDir(locale: Locale): "ltr" | "rtl" {
  return LOCALE_META[locale].dir;
}

/** The first path segment if it is a supported locale, else `null`. */
export function localeFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/")[1] ?? "";
  return isLocale(segment) ? segment : null;
}

/**
 * The URL prefix for a locale: empty for English (canonical root URLs) and
 * `/es`, `/pt`, `/ar` otherwise.
 */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

/** Remove a leading `/en|/es|/pt|/ar` segment from a pathname. */
export function stripLocalePrefix(pathname: string): string {
  const locale = localeFromPathname(pathname);
  if (!locale) {
    return pathname;
  }
  const rest = pathname.slice(`/${locale}`.length);
  return rest === "" ? "/" : rest;
}

/** The `hreflang` value for a locale (`ar` uses the plain code). */
export function hreflang(locale: Locale): string {
  return locale;
}

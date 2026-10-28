/**
 * Client-safe localization configuration: the supported public languages, their
 * labels, text direction and URL-prefix rules.
 *
 * English is the canonical language and lives at the existing root URLs
 * (`/about-us`, `/products/...`). Non-English languages are served under a
 * prefix (`/es/...`, `/pt/...`, `/ar/...`) so existing English links and SEO
 * never break. The admin is never localized.
 *
 * A language is not a country. Each locale carries one *reference country* —
 * the country the translation is written for. The flag shown beside it in the
 * selector is that country's flag, not a claim about where the language is
 * spoken.
 */
export const LOCALES = [
  "en",
  "fr",
  "pt",
  "es",
  "zh",
  "hi",
  "ar",
  "bn",
  "ru",
  "ja",
  "de",
  "id",
  "ur",
  "sw",
  "nl",
  "pl",
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Request header the proxy sets so server components know the locale. */
export const LOCALE_HEADER = "x-safeway-locale";

/**
 * Marker the proxy adds to requests it rewrote itself. It lets the proxy
 * recognise an internal locale rewrite and leave that request untouched.
 */
export const LOCALE_REWRITE_HEADER = "x-safeway-locale-rewrite";

/** Cookie that remembers a visitor's chosen language. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** How long the remembered language is kept, in seconds (one year). */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** The non-English locales that carry a URL prefix. */
export const PREFIXED_LOCALES = [
  "fr",
  "pt",
  "es",
  "zh",
  "hi",
  "ar",
  "bn",
  "ru",
  "ja",
  "de",
  "id",
  "ur",
  "sw",
  "nl",
  "pl",
] as const;

export type PrefixedLocale = (typeof PREFIXED_LOCALES)[number];

export function isPrefixedLocale(value: unknown): value is PrefixedLocale {
  return (
    typeof value === "string" &&
    (PREFIXED_LOCALES as readonly string[]).includes(value)
  );
}

/**
 * The script a language is written in. It selects the typeface stack the page
 * is rendered with: Mona Sans covers Latin, Anek Devanagari covers the
 * Devanagari languages and Anek Bangla covers Bengali. Chinese and Japanese
 * fall back to the reader's system font, which is the usual approach for
 * CJK web typography.
 */
export type LocaleScript = "latin" | "devanagari" | "bangla";

export type LocaleMeta = {
  /** Full name in the language itself, shown inside the dropdown. */
  nativeName: string;
  /** Compact code shown in the closed header state. */
  short: string;
  dir: "ltr" | "rtl";
  /**
   * The reference country whose flag represents this language. It is the
   * country the translation is written for — not a list of every country
   * where the language is spoken.
   */
  country: string;
  /** ISO 3166-1 alpha-2 code of the reference country, used for its flag. */
  countryCode: string;
  /** The script the translation is written in. */
  script: LocaleScript;
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: {
    nativeName: "English",
    short: "EN",
    dir: "ltr",
    country: "United Kingdom",
    countryCode: "GB",
    script: "latin",
  },
  fr: {
    nativeName: "Français",
    short: "FR",
    dir: "ltr",
    country: "France",
    countryCode: "FR",
    script: "latin",
  },
  pt: {
    nativeName: "Português",
    short: "PT",
    dir: "ltr",
    country: "Portugal",
    countryCode: "PT",
    script: "latin",
  },
  es: {
    nativeName: "Español",
    short: "ES",
    dir: "ltr",
    country: "Spain",
    countryCode: "ES",
    script: "latin",
  },
  zh: {
    nativeName: "简体中文",
    short: "ZH",
    dir: "ltr",
    country: "China",
    countryCode: "CN",
    script: "latin",
  },
  hi: {
    nativeName: "हिन्दी",
    short: "HI",
    dir: "ltr",
    country: "India",
    countryCode: "IN",
    script: "devanagari",
  },
  ar: {
    nativeName: "العربية",
    short: "AR",
    dir: "rtl",
    country: "Saudi Arabia",
    countryCode: "SA",
    script: "latin",
  },
  bn: {
    nativeName: "বাংলা",
    short: "BN",
    dir: "ltr",
    country: "Bangladesh",
    countryCode: "BD",
    script: "bangla",
  },
  ru: {
    nativeName: "Русский",
    short: "RU",
    dir: "ltr",
    country: "Russia",
    countryCode: "RU",
    script: "latin",
  },
  ja: {
    nativeName: "日本語",
    short: "JA",
    dir: "ltr",
    country: "Japan",
    countryCode: "JP",
    script: "latin",
  },
  de: {
    nativeName: "Deutsch",
    short: "DE",
    dir: "ltr",
    country: "Germany",
    countryCode: "DE",
    script: "latin",
  },
  id: {
    nativeName: "Bahasa Indonesia",
    short: "ID",
    dir: "ltr",
    country: "Indonesia",
    countryCode: "ID",
    script: "latin",
  },
  ur: {
    nativeName: "اردو",
    short: "UR",
    dir: "rtl",
    country: "Pakistan",
    countryCode: "PK",
    script: "devanagari",
  },
  sw: {
    nativeName: "Kiswahili",
    short: "SW",
    dir: "ltr",
    country: "Kenya",
    countryCode: "KE",
    script: "latin",
  },
  nl: {
    nativeName: "Nederlands",
    short: "NL",
    dir: "ltr",
    country: "Netherlands",
    countryCode: "NL",
    script: "latin",
  },
  pl: {
    nativeName: "Polski",
    short: "PL",
    dir: "ltr",
    country: "Poland",
    countryCode: "PL",
    script: "latin",
  },
};

/** In dropdown order. */
export const LOCALE_ORDER: readonly Locale[] = [
  "en",
  "fr",
  "pt",
  "es",
  "zh",
  "hi",
  "ar",
  "bn",
  "ru",
  "ja",
  "de",
  "id",
  "ur",
  "sw",
  "nl",
  "pl",
];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function localeDir(locale: Locale): "ltr" | "rtl" {
  return LOCALE_META[locale].dir;
}

/** The script a locale is written in. */
export function localeScript(locale: Locale): LocaleScript {
  return LOCALE_META[locale].script;
}

/** The first path segment if it is a supported locale, else `null`. */
export function localeFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/")[1] ?? "";
  return isLocale(segment) ? segment : null;
}

/**
 * The locale a path is served in: the prefix when there is one, otherwise the
 * default (English) locale the unprefixed URLs are served in.
 */
export function localeForPathname(pathname: string): Locale {
  return localeFromPathname(pathname) ?? DEFAULT_LOCALE;
}

/**
 * The URL prefix for a locale: empty for English (canonical root URLs) and
 * `/es`, `/pt`, `/ar`, ... otherwise.
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

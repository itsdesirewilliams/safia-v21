import { LOCALE_META, type Locale } from "@/lib/i18n/config";

/** The canonical production origin (apex). `www` permanently redirects here. */
export const SITE_URL = "https://safewaytyre.com";

/** Turn a site-relative path into an absolute canonical URL. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Open Graph locale code for a language (e.g. `fr_FR`). */
export function ogLocale(locale: Locale): string {
  return `${locale}_${LOCALE_META[locale].countryCode}`;
}

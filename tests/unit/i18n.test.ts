import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_ORDER,
  localeDir,
  localeFromPathname,
  localePrefix,
  stripLocalePrefix,
} from "@/lib/i18n/config";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import {
  languageAlternates,
  localizedHref,
  switchLocaleHref,
} from "@/lib/i18n/url";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") {
    return [prefix];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, v]) =>
    keyPaths(v, prefix ? `${prefix}.${key}` : key),
  );
}

describe("locale config", () => {
  it("supports exactly the four public languages, English default", () => {
    expect(LOCALE_ORDER).toEqual(["en", "es", "pt", "ar"]);
    expect(DEFAULT_LOCALE).toBe("en");
    expect(isLocale("es")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("marks only Arabic as right-to-left", () => {
    expect(localeDir("en")).toBe("ltr");
    expect(localeDir("es")).toBe("ltr");
    expect(localeDir("pt")).toBe("ltr");
    expect(localeDir("ar")).toBe("rtl");
  });

  it("keeps English on the root and prefixes the others", () => {
    expect(localePrefix("en")).toBe("");
    expect(localePrefix("es")).toBe("/es");
    expect(localePrefix("ar")).toBe("/ar");
  });

  it("detects and strips a locale prefix", () => {
    expect(localeFromPathname("/es/about-us")).toBe("es");
    expect(localeFromPathname("/about-us")).toBeNull();
    expect(stripLocalePrefix("/ar/products/agriculture")).toBe(
      "/products/agriculture",
    );
    expect(stripLocalePrefix("/es")).toBe("/");
    expect(stripLocalePrefix("/about-us")).toBe("/about-us");
  });
});

describe("locale-aware URLs", () => {
  it("builds canonical English and prefixed localized hrefs", () => {
    expect(localizedHref("en", "/products/agriculture")).toBe(
      "/products/agriculture",
    );
    expect(localizedHref("es", "/products/agriculture")).toBe(
      "/es/products/agriculture",
    );
    expect(localizedHref("ar", "/")).toBe("/ar");
  });

  it("switches language while preserving the current page", () => {
    expect(switchLocaleHref("es", "/products/agriculture")).toBe(
      "/es/products/agriculture",
    );
    expect(switchLocaleHref("ar", "/es/products/agriculture")).toBe(
      "/ar/products/agriculture",
    );
    expect(switchLocaleHref("en", "/es/products/agriculture")).toBe(
      "/products/agriculture",
    );
  });

  it("provides hreflang alternates for every locale", () => {
    expect(languageAlternates("/catalogue")).toEqual({
      en: "/catalogue",
      es: "/es/catalogue",
      pt: "/pt/catalogue",
      ar: "/ar/catalogue",
    });
  });
});

describe("dictionaries", () => {
  it("define the same keys in every language", () => {
    const reference = keyPaths(DICTIONARIES.en).sort();
    for (const locale of LOCALE_ORDER) {
      expect(keyPaths(DICTIONARIES[locale]).sort(), locale).toEqual(reference);
    }
  });

  it("translate category names but never technical identifiers", () => {
    expect(DICTIONARIES.es.categories.agriculture).toBe("Neumáticos agrícolas");
    expect(DICTIONARIES.ar.categories.agriculture).toBe("الإطارات الزراعية");
    // TT/TL is a technical abbreviation and must stay identical.
    for (const locale of LOCALE_ORDER) {
      expect(DICTIONARIES[locale].spec.ttTl).toBe("TT/TL");
    }
  });
});

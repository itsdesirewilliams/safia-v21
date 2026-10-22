import { describe, expect, it } from "vitest";

import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_META,
  LOCALE_ORDER,
  localeDir,
  localeForPathname,
  localeFromPathname,
  localePrefix,
  localeScript,
  LOCALES,
  PREFIXED_LOCALES,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/config";
import {
  DICTIONARIES,
  dictionaryKeyPaths,
  missingDictionaryKeys,
  resolveLocale,
} from "@/lib/i18n/dictionaries";
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

/** The words that only appear in English prose, never in a proper-noun heading. */
const ENGLISH_PROSE =
  /\b(the|and|of|to|with|for|from|our|your|every|each|is|are|we|you|it)\b/i;

const EXPECTED_LOCALES: Locale[] = [
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

describe("locale config", () => {
  it("supports at least the fourteen public languages, English default", () => {
    expect(LOCALE_ORDER.length).toBeGreaterThanOrEqual(14);
    for (const locale of EXPECTED_LOCALES) {
      expect(LOCALE_ORDER, locale).toContain(locale);
      expect(isLocale(locale), locale).toBe(true);
    }
    expect([...LOCALES].sort()).toEqual([...LOCALE_ORDER].sort());
    expect(DEFAULT_LOCALE).toBe("en");
    expect(isLocale("xx")).toBe(false);
  });

  it("marks Arabic and Urdu as right-to-left", () => {
    expect(localeDir("ar")).toBe("rtl");
    expect(localeDir("ur")).toBe("rtl");
    for (const locale of LOCALE_ORDER) {
      if (locale === "ar" || locale === "ur") {
        continue;
      }
      expect(localeDir(locale), locale).toBe("ltr");
    }
  });

  it("keeps English on the root and prefixes the others", () => {
    expect(localePrefix("en")).toBe("");
    for (const locale of PREFIXED_LOCALES) {
      expect(localePrefix(locale)).toBe(`/${locale}`);
    }
    expect([...PREFIXED_LOCALES].sort()).toEqual(
      EXPECTED_LOCALES.filter((locale) => locale !== "en").sort(),
    );
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

  it("resolves the locale a path is served in", () => {
    expect(localeForPathname("/sw")).toBe("sw");
    expect(localeForPathname("/sw/about-us")).toBe("sw");
    expect(localeForPathname("/about-us")).toBe("en");
    expect(localeForPathname("/")).toBe("en");
  });

  it("pairs every language with a reference country and a flag code", () => {
    for (const locale of LOCALE_ORDER) {
      const meta = LOCALE_META[locale];
      expect(meta.nativeName.length, locale).toBeGreaterThan(0);
      expect(meta.short, locale).toMatch(/^[A-Z]{2}$/);
      expect(meta.country.length, locale).toBeGreaterThan(0);
      expect(meta.countryCode, locale).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("uses the requested reference country for every language", () => {
    expect(LOCALE_META.en.countryCode).toBe("GB");
    expect(LOCALE_META.fr.countryCode).toBe("FR");
    expect(LOCALE_META.pt.countryCode).toBe("PT");
    expect(LOCALE_META.es.countryCode).toBe("ES");
    expect(LOCALE_META.zh.countryCode).toBe("CN");
    expect(LOCALE_META.hi.countryCode).toBe("IN");
    expect(LOCALE_META.ar.countryCode).toBe("SA");
    expect(LOCALE_META.bn.countryCode).toBe("BD");
    expect(LOCALE_META.ru.countryCode).toBe("RU");
    expect(LOCALE_META.ja.countryCode).toBe("JP");
    expect(LOCALE_META.de.countryCode).toBe("DE");
    expect(LOCALE_META.id.countryCode).toBe("ID");
    expect(LOCALE_META.ur.countryCode).toBe("PK");
    expect(LOCALE_META.sw.countryCode).toBe("KE");
  });

  it("records the script each language is written in", () => {
    expect(localeScript("en")).toBe("latin");
    expect(localeScript("hi")).toBe("devanagari");
    expect(localeScript("ur")).toBe("devanagari");
    expect(localeScript("bn")).toBe("bangla");
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
    expect(switchLocaleHref("sw", "/")).toBe("/sw");
    expect(switchLocaleHref("en", "/sw")).toBe("/");
  });

  it("provides hreflang alternates for every locale", () => {
    const alternates = languageAlternates("/catalogue");
    expect(Object.keys(alternates).sort()).toEqual([...LOCALE_ORDER].sort());
    expect(alternates.en).toBe("/catalogue");
    expect(alternates.fr).toBe("/fr/catalogue");
    expect(alternates.zh).toBe("/zh/catalogue");
    expect(alternates.ur).toBe("/ur/catalogue");
  });
});

describe("dictionaries", () => {
  it("define the same keys in every language", () => {
    const reference = keyPaths(DICTIONARIES.en).sort();
    for (const locale of LOCALE_ORDER) {
      expect(keyPaths(DICTIONARIES[locale]).sort(), locale).toEqual(reference);
    }
  });

  it("has no missing or empty values in any language", () => {
    for (const locale of LOCALE_ORDER) {
      expect(missingDictionaryKeys(locale), locale).toEqual([]);
      for (const path of dictionaryKeyPaths(DICTIONARIES[locale])) {
        const value = path
          .split(".")
          .reduce<unknown>(
            (node, key) =>
              node && typeof node === "object"
                ? (node as Record<string, unknown>)[key]
                : undefined,
            DICTIONARIES[locale],
          );
        expect(typeof value, `${locale}.${path}`).toBe("string");
        expect(
          (value as string).trim().length,
          `${locale}.${path}`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("never leaves a long English sentence in a translated language", () => {
    const english = new Map(
      dictionaryKeyPaths(DICTIONARIES.en).map((path) => [
        path,
        path
          .split(".")
          .reduce<unknown>(
            (node, key) =>
              node && typeof node === "object"
                ? (node as Record<string, unknown>)[key]
                : undefined,
            DICTIONARIES.en,
          ) as string,
      ]),
    );

    for (const locale of LOCALE_ORDER) {
      if (locale === "en") {
        continue;
      }
      for (const path of dictionaryKeyPaths(DICTIONARIES[locale])) {
        const value = path
          .split(".")
          .reduce<unknown>(
            (node, key) =>
              node && typeof node === "object"
                ? (node as Record<string, unknown>)[key]
                : undefined,
            DICTIONARIES[locale],
          ) as string;
        const source = english.get(path) ?? "";
        // Long copy must be translated. Headings made only of proper nouns
        // ("Radial — Shandong, China") are legitimately identical, so only
        // values that still read as English prose are flagged.
        if (source.length > 20 && ENGLISH_PROSE.test(source)) {
          expect(value, `${locale}.${path}`).not.toBe(source);
        }
      }
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

  it("keeps product and company identifiers out of the translations", () => {
    for (const locale of LOCALE_ORDER) {
      const dict = DICTIONARIES[locale];
      // The company name is a name, not copy.
      expect(dict.meta.homeTitle, locale).toContain("Safeway Tyre");
      expect(dict.footer.socialAria, locale).toContain("Safeway Tyre");
    }
  });

  it("reports a complete language as active", () => {
    for (const locale of LOCALE_ORDER) {
      expect(resolveLocale(locale)).toBe(locale);
    }
  });
});

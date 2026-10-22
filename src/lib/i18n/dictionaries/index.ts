import { DEFAULT_LOCALE, type Locale } from "../config";

import { ar } from "./ar";
import { bn } from "./bn";
import { de } from "./de";
import { en, type Dictionary } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { hi } from "./hi";
import { id } from "./id";
import { ja } from "./ja";
import { nl } from "./nl";
import { pl } from "./pl";
import { pt } from "./pt";
import { ru } from "./ru";
import { sw } from "./sw";
import { ur } from "./ur";
import { zh } from "./zh";

/** All dictionaries, keyed by locale. English is the fallback. */
export const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  fr,
  pt,
  es,
  zh,
  hi,
  ar,
  bn,
  ru,
  ja,
  de,
  id,
  ur,
  sw,
  nl,
  pl,
};

export function dictionaryFor(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? en;
}

/** Every leaf path of a dictionary, used to compare coverage. */
export function dictionaryKeyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") {
    return [prefix];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, v]) =>
    dictionaryKeyPaths(v, prefix ? `${prefix}.${key}` : key),
  );
}

const MISSING_KEYS = new Map<Locale, string[]>();

/**
 * The keys a locale is missing compared with the English reference, plus any
 * key that is present but empty. A locale with gaps is never presented as
 * fully translated — it falls back to English instead.
 */
export function missingDictionaryKeys(locale: Locale): string[] {
  const cached = MISSING_KEYS.get(locale);
  if (cached) {
    return cached;
  }

  const reference = new Set(dictionaryKeyPaths(DICTIONARIES[DEFAULT_LOCALE]));
  const present = new Set(dictionaryKeyPaths(DICTIONARIES[locale]));
  const missing = [...reference].filter((path) => !present.has(path));

  const empty: string[] = [];
  for (const path of present) {
    const value = valueAtPath(DICTIONARIES[locale], path);
    if (typeof value !== "string" || value.trim() === "") {
      empty.push(path);
    }
  }

  const gaps = [...missing, ...empty].sort();
  MISSING_KEYS.set(locale, gaps);
  return gaps;
}

function valueAtPath(dictionary: Dictionary, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (node, key) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[key]
          : undefined,
      dictionary,
    );
}

/**
 * The locale that can actually be rendered. A language is only reported as
 * active when its dictionary covers every key, so the header can never show a
 * language the page is not written in.
 */
export function resolveLocale(locale: Locale): Locale {
  if (locale === DEFAULT_LOCALE) {
    return DEFAULT_LOCALE;
  }
  return missingDictionaryKeys(locale).length === 0 ? locale : DEFAULT_LOCALE;
}

export type { Dictionary };

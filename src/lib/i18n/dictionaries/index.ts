import type { Locale } from "../config";

import { ar } from "./ar";
import { en, type Dictionary } from "./en";
import { es } from "./es";
import { pt } from "./pt";

/** All dictionaries, keyed by locale. English is the fallback. */
export const DICTIONARIES: Record<Locale, Dictionary> = { en, es, pt, ar };

export function dictionaryFor(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? en;
}

export type { Dictionary };

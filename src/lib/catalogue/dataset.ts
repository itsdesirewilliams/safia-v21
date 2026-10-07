import masterData from "../../../supabase/master-product-data.json";

import { normalizeTyreSize } from "@/lib/search/tyre-size";

import {
  normalizeMasterData,
  type MasterDataset,
  type NormalizedPattern,
} from "./normalize";

/**
 * The normalized catalogue, built once from the supplied master dataset
 * (`supabase/master-product-data.json`) through the normalization seam. Product
 * data comes only from that dataset — never the old website (CONTEXT.md).
 *
 * The dataset is small (≈55 patterns) and public (spec fields only, no
 * pricing), so it ships with the app and the catalogue pages render
 * deterministically without a network round-trip.
 */
export const CATALOGUE = normalizeMasterData(
  masterData as unknown as MasterDataset,
);

/** Every Pattern in a Category, in pattern-code order. */
export function listPatternsByCategory(
  categorySlug: string,
): NormalizedPattern[] {
  return CATALOGUE.patterns.filter(
    (pattern) => pattern.categorySlug === categorySlug,
  );
}

/** A single Pattern by its Category slug and Pattern slug. */
export function getPattern(
  categorySlug: string,
  patternSlug: string,
): NormalizedPattern | undefined {
  return CATALOGUE.patterns.find(
    (pattern) =>
      pattern.categorySlug === categorySlug && pattern.slug === patternSlug,
  );
}

/** The distinct variant sizes of a Pattern, in the order they appear. */
export function patternSizes(pattern: NormalizedPattern): string[] {
  const seen = new Set<string>();
  const sizes: string[] = [];
  for (const variant of pattern.variants) {
    const size = variant.public.size;
    if (size && !seen.has(size)) {
      seen.add(size);
      sizes.push(size);
    }
  }
  return sizes;
}

let cachedSizeDictionary: ReadonlyMap<string, string> | null = null;

/**
 * Every canonical Variant size in the catalogue, keyed by BOTH its lower-cased
 * form and its canonical tyre-size key (`normalizeTyreSize`), with the value the
 * exact size as stored (e.g. `11l-15` → `11L-15`, `7.5-16` → `7.50-16`). This is
 * the authority the search-normalization layer confirms its candidates against:
 * normalization proposes, the dataset disposes. Because both sides are keyed the
 * same way, a formatting variation ("6.50 16", "6.50/16") resolves to the same
 * stored size.
 */
export function catalogueSizeDictionary(): ReadonlyMap<string, string> {
  if (cachedSizeDictionary) {
    return cachedSizeDictionary;
  }

  const sizes = new Map<string, string>();
  for (const pattern of CATALOGUE.patterns) {
    for (const variant of pattern.variants) {
      const size = variant.public.size;
      if (!size) {
        continue;
      }
      const key = size.toLowerCase();
      if (!sizes.has(key)) {
        sizes.set(key, size);
      }
      const canonical = normalizeTyreSize(size);
      if (canonical && !sizes.has(canonical)) {
        sizes.set(canonical, size);
      }
    }
  }

  cachedSizeDictionary = sizes;
  return sizes;
}

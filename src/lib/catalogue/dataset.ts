import masterData from "../../../supabase/master-product-data.json";

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

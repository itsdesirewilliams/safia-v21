import type { PatternImageDirectoryEntry } from "@/lib/media/pattern-image-batch";

import { CATEGORIES } from "./categories";
import { CATALOGUE } from "./dataset";
import { RANGE_DATASETS } from "./range-data";

/**
 * A serializable index of every Pattern across the whole catalogue, for the
 * Admin Pattern Image uploader. It carries no Variants, so it can be passed from
 * the server page to the client uploader without shipping the whole catalogue.
 *
 * The index is derived from the existing catalogue data — the master product
 * dataset plus the TBR and PCR radial ranges — so it automatically covers every
 * range. Nothing here is a hardcoded Pattern Code list: adding a Pattern to any
 * dataset makes it resolvable with no code change.
 */
export function patternDirectory(): PatternImageDirectoryEntry[] {
  const nameBySlug = new Map(
    CATEGORIES.map((category) => [category.slug, category.displayName]),
  );

  const master: PatternImageDirectoryEntry[] = CATALOGUE.patterns.map(
    (pattern) => {
      const categoryName =
        nameBySlug.get(pattern.categorySlug) ?? pattern.categorySlug;
      return {
        patternCode: pattern.patternCode,
        displayName: pattern.displayName,
        categorySlug: pattern.categorySlug,
        categoryName,
        // The Nylon Truck & Bus range is the master truck-bus category; every
        // other master Pattern is identified by its category.
        range: pattern.categorySlug === "truck-bus" ? "Nylon" : categoryName,
      };
    },
  );

  const tbr: PatternImageDirectoryEntry[] = RANGE_DATASETS.tbr.patterns.map(
    (pattern) => ({
      patternCode: pattern.patternCode,
      displayName: pattern.patternCode,
      categorySlug: "truck-bus",
      categoryName: "Truck & Bus Radial",
      range: "TBR",
    }),
  );

  const pcr: PatternImageDirectoryEntry[] = RANGE_DATASETS.pcr.patterns.map(
    (pattern) => ({
      patternCode: pattern.patternCode,
      displayName: pattern.patternCode,
      categorySlug: "truck-bus",
      categoryName: "Passenger Car Radial",
      range: "PCR",
    }),
  );

  return [...master, ...tbr, ...pcr];
}

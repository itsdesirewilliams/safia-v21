import type { CategorySlug } from "./categories";
import type { NormalizedPattern } from "./normalize";

import pcrJson from "./data/pcr.json";
import tbrJson from "./data/tbr.json";

/**
 * The radial product ranges that sit beside the existing Nylon Truck & Bus
 * category: TBR (Truck & Bus Radial) and PCR (Passenger Car Radial).
 *
 * The datasets are normalized JSON generated from the source order-sheet
 * extraction by `scripts/import-range-data.mjs`, so hundreds of rows never live
 * inside React components. Public pages read only the public fields (size,
 * application, LI/SR, CC); commercial fields are preserved under `internal` and
 * are never rendered.
 */

export type RangeId = "tbr" | "pcr";

/** Both radial ranges present under the canonical Truck & Bus category. */
export const RANGE_CATEGORY: CategorySlug = "truck-bus";

export type RangeVariant = {
  /** Source SIZE, preserved exactly. */
  size: string;
  /** Category-level application (Truck & Bus | Passenger Car). */
  application: string;
  /** Source LI/SR, or null when the source cell is blank. */
  liSr: string | null;
  /** Source QTY/40HQ (PCS) — the container capacity (CC). */
  cc: number | null;
  /** Internal/commercial source fields; never rendered publicly. */
  internal: Record<string, string | number | null>;
};

export type RangePattern = {
  patternCode: string;
  slug: string;
  variants: RangeVariant[];
};

export type RangeDataset = {
  range: RangeId;
  application: string;
  patterns: RangePattern[];
};

export const RANGE_DATASETS: Record<RangeId, RangeDataset> = {
  tbr: tbrJson as unknown as RangeDataset,
  pcr: pcrJson as unknown as RangeDataset,
};

/** Every Pattern in a range, in source order. */
export function listRangePatterns(range: RangeId): RangePattern[] {
  return RANGE_DATASETS[range].patterns;
}

/** The category-level application label for a range. */
export function rangeApplication(range: RangeId): string {
  return RANGE_DATASETS[range].application;
}

/** A single Pattern by its slug, or `undefined` when unknown. */
export function getRangePattern(
  range: RangeId,
  slug: string,
): RangePattern | undefined {
  return RANGE_DATASETS[range].patterns.find((pattern) => pattern.slug === slug);
}

/** The distinct variant sizes of a Pattern, in source order. */
export function rangePatternSizes(pattern: RangePattern): string[] {
  const seen = new Set<string>();
  const sizes: string[] = [];
  for (const variant of pattern.variants) {
    if (variant.size && !seen.has(variant.size)) {
      seen.add(variant.size);
      sizes.push(variant.size);
    }
  }
  return sizes;
}

/**
 * Adapt a range Pattern into the shared `NormalizedPattern` shape so the
 * existing Pattern card can render it unchanged. Only the public `size` field
 * is carried; the range table renders LI/SR and CC separately.
 */
export function rangePatternToNormalized(
  pattern: RangePattern,
): NormalizedPattern {
  return {
    categorySlug: RANGE_CATEGORY,
    patternCode: pattern.patternCode,
    displayName: pattern.patternCode,
    slug: pattern.slug,
    variants: pattern.variants.map((variant) => ({
      public: {
        size: variant.size,
        plyRating: null,
        ttTl: null,
        application: variant.application,
        rimWidthInch: null,
        tread: null,
        tyreType: null,
      },
      weightKg: null,
    })),
  };
}

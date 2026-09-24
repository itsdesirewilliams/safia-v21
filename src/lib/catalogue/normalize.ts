import {
  CATEGORIES,
  type CategorySlug,
} from "@/lib/catalogue/categories";
import { slugify } from "@/lib/slug";

/**
 * Catalogue normalization seam (spec #1 / Ticket #18).
 *
 * Every value on the public catalogue passes through here before any page
 * renders. It maps the heterogeneous source price-list data onto the canonical
 * Category → Pattern → Variant model:
 *
 * - the source `name` becomes the customer-facing `displayName`;
 * - the Pattern slug is the slugified display name with the `patternCode`
 *   always appended (guaranteeing uniqueness);
 * - only the public Variant fields survive (`size`, `plyRating`, `ttTl`,
 *   `application`, and Forklift `rimWidthInch`/`tread`/`tyreType`);
 * - `weightKg` is retained as internal-only data;
 * - pricing/shipping (`fobUsd`, `container`) is dropped and can never leak.
 *
 * This module is pure and free of runtime dependencies, so it is the primary
 * test seam.
 */

/** The subset of a raw Variant that normalization reads. */
export type MasterVariant = {
  size?: string | null;
  plyRating?: number | string | null;
  ttTl?: string | null;
  application?: string | null;
  rimWidthInch?: number | string | null;
  tread?: string | null;
  tyreType?: string | null;
  weightKg?: number | null;
  /** Dropped by normalization (internal/shipping). */
  fobUsd?: number | null;
  container?: unknown;
};

export type MasterPattern = {
  patternCode: string;
  name: string;
  variants?: readonly MasterVariant[];
};

export type MasterRange = {
  slug: string;
  patterns?: readonly MasterPattern[];
};

export type MasterDataset = {
  schemaVersion: string;
  productRanges: readonly MasterRange[];
};

/** The fields shown publicly for one Variant (spec #1). */
export type PublicVariant = {
  size: string;
  plyRating: string | null;
  ttTl: string | null;
  application: string | null;
  rimWidthInch: string | null;
  tread: string | null;
  tyreType: string | null;
};

export type NormalizedVariant = {
  public: PublicVariant;
  /** Internal-only per spec #1 — retained, never rendered. */
  weightKg: number | null;
};

export type NormalizedPattern = {
  categorySlug: CategorySlug;
  patternCode: string;
  displayName: string;
  slug: string;
  variants: readonly NormalizedVariant[];
};

export type NormalizedCategory = {
  slug: CategorySlug;
  displayName: string;
  /** False for Tubes while its data is deferred (spec #1). */
  hasData: boolean;
};

export type NormalizedCatalogue = {
  categories: readonly NormalizedCategory[];
  patterns: readonly NormalizedPattern[];
};

/** Maps the master range slugs onto the canonical category slugs. */
const MASTER_RANGE_CATEGORY: Record<string, CategorySlug> = {
  motorcycle: "motorcycle",
  "three-wheeler": "three-wheeler",
  "truck-bus": "truck-bus",
  agriculture: "agriculture",
  otr: "otr",
  // The master data calls the range "forklift-industrial"; the canonical
  // category slug is "forklift".
  "forklift-industrial": "forklift",
};

/** `displayName` + always-appended `patternCode` → unique Pattern slug. */
export function patternSlug(displayName: string, patternCode: string): string {
  return `${slugify(displayName)}-${slugify(patternCode)}`;
}

/** A public text field: blank/absent cells become `null`, never "". */
function text(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const stringValue = typeof value === "number" ? String(value) : value.trim();
  return stringValue === "" ? null : stringValue;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function normalizeVariant(raw: MasterVariant): NormalizedVariant {
  return {
    public: {
      size: text(raw.size) ?? "",
      plyRating: text(raw.plyRating),
      ttTl: text(raw.ttTl),
      application: text(raw.application),
      rimWidthInch: text(raw.rimWidthInch),
      tread: text(raw.tread),
      tyreType: text(raw.tyreType),
    },
    weightKg: typeof raw.weightKg === "number" ? round(raw.weightKg, 3) : null,
  };
}

function resolveCategorySlug(range: MasterRange): CategorySlug | undefined {
  return MASTER_RANGE_CATEGORY[range.slug];
}

/**
 * Normalize a raw master dataset into the canonical catalogue model.
 *
 * The source `name` already encodes the agreed `displayName` per category
 * (the functional source name for Agriculture/OTR/Forklift, the category name
 * otherwise), so it is carried through unchanged.
 */
export function normalizeMasterData(raw: MasterDataset): NormalizedCatalogue {
  const patterns: NormalizedPattern[] = [];

  for (const range of raw.productRanges) {
    const categorySlug = resolveCategorySlug(range);
    if (!categorySlug) {
      continue;
    }

    for (const pattern of range.patterns ?? []) {
      patterns.push({
        categorySlug,
        patternCode: pattern.patternCode,
        displayName: pattern.name,
        slug: patternSlug(pattern.name, pattern.patternCode),
        variants: (pattern.variants ?? []).map(normalizeVariant),
      });
    }
  }

  patterns.sort(
    (a, b) =>
      a.categorySlug.localeCompare(b.categorySlug) ||
      a.patternCode.localeCompare(b.patternCode),
  );

  const populated = new Set(patterns.map((pattern) => pattern.categorySlug));

  const categories: NormalizedCategory[] = CATEGORIES.map((category) => ({
    slug: category.slug,
    displayName: category.displayName,
    hasData: populated.has(category.slug),
  }));

  return { categories, patterns };
}

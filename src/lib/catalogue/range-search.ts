import { MIN_SEARCH_LENGTH } from "@/lib/search/limits";
import { normalizeTyreSize } from "@/lib/search/tyre-size";
import { ROUTES } from "@/lib/routes";

import {
  RANGE_DATASETS,
  rangePatternSizes,
  type RangeId,
  type RangePattern,
} from "./range-data";
import type { SearchResult } from "./search-result";

/**
 * Local search over the radial ranges (TBR/PCR).
 *
 * These ranges ship as normalized JSON (`range-data.ts`) rather than being
 * seeded into Postgres, so they are matched here and merged with the database
 * results by `searchPatterns`. The index is built once at module load from the
 * existing catalogue data — there is deliberately no second copy of the product
 * database.
 *
 * Public search rules: Pattern Codes are internal identifiers and are NOT part
 * of the public search surface, so they are excluded from the index entirely.
 * Customers find these ranges by tyre size or by product/range name. Both the
 * indexed sizes and the incoming query run through the one canonical
 * `normalizeTyreSize`, so formatting variations resolve to the same size.
 */

const RANGE_META: Record<
  RangeId,
  { label: string; publicName: string }
> = {
  tbr: { label: "TBR", publicName: "Truck & Bus Radial Tyres" },
  pcr: { label: "PCR", publicName: "Passenger Car Radial Tyres" },
};

const RANGES: readonly RangeId[] = ["tbr", "pcr"];

type RangeEntry = {
  range: RangeId;
  pattern: RangePattern;
  application: string;
  publicName: string;
  href: string;
  /** Canonical size key → the public size label shown to customers. */
  canonicalSizes: Map<string, string>;
  /** Distinct public size labels, in source order. */
  displaySizes: string[];
  /** Lower-cased public text a query token may match (sizes, names). */
  haystack: string;
};

function buildRangeIndex(): RangeEntry[] {
  const entries: RangeEntry[] = [];

  for (const range of RANGES) {
    const dataset = RANGE_DATASETS[range];
    const meta = RANGE_META[range];

    for (const pattern of dataset.patterns) {
      const canonicalSizes = new Map<string, string>();
      for (const size of rangePatternSizes(pattern)) {
        const canonical = normalizeTyreSize(size) ?? size;
        if (!canonicalSizes.has(canonical)) {
          canonicalSizes.set(canonical, canonical);
        }
      }
      const displaySizes = [...canonicalSizes.values()];

      const href =
        range === "tbr"
          ? ROUTES.tbrPattern(pattern.slug)
          : ROUTES.pcrPattern(pattern.slug);

      const haystack = [
        dataset.application,
        meta.label,
        meta.publicName,
        ...displaySizes,
      ]
        .join(" ")
        .toLowerCase();

      entries.push({
        range,
        pattern,
        application: dataset.application,
        publicName: meta.publicName,
        href,
        canonicalSizes,
        displaySizes,
        haystack,
      });
    }
  }

  return entries;
}

const RANGE_INDEX = buildRangeIndex();

function toResult(entry: RangeEntry, matchedSize: string | null): SearchResult {
  return {
    categorySlug: "truck-bus",
    categoryDisplayName: matchedSize ? entry.publicName : entry.application,
    patternSlug: entry.pattern.slug,
    // Internal only: never rendered. Kept so the range result is identifiable.
    patternCode: entry.pattern.patternCode,
    displayName: matchedSize ?? entry.publicName,
    sizes: entry.displaySizes,
    href: entry.href,
    range: RANGE_META[entry.range].label,
  };
}

/**
 * Patterns from the TBR/PCR ranges matching `query`. Exact normalized-size
 * matches rank first; otherwise public text (sizes, range/product names) is
 * matched. Pattern Codes are never searched.
 */
export function searchRanges(query: string): SearchResult[] {
  const cleaned = query.trim().toLowerCase();
  if (cleaned.length < MIN_SEARCH_LENGTH) {
    return [];
  }

  const canonical = normalizeTyreSize(query);
  const results: SearchResult[] = [];
  const seen = new Set<string>();

  if (canonical) {
    for (const entry of RANGE_INDEX) {
      const size = entry.canonicalSizes.get(canonical);
      if (size && !seen.has(entry.href)) {
        seen.add(entry.href);
        results.push(toResult(entry, size));
      }
    }
    if (results.length > 0) {
      return results;
    }
  }

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  for (const entry of RANGE_INDEX) {
    if (seen.has(entry.href)) {
      continue;
    }
    if (tokens.every((token) => entry.haystack.includes(token))) {
      seen.add(entry.href);
      results.push(toResult(entry, null));
    }
  }

  return results;
}

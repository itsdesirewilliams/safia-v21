import { describe, expect, it } from "vitest";

import { CATEGORIES, getCategory } from "@/lib/catalogue/categories";
import { CATALOGUE } from "@/lib/catalogue/dataset";
import { RANGE_DATASETS, rangePatternSizes } from "@/lib/catalogue/range-data";
import {
  HERO_SUGGESTION_COUNT,
  pickHeroSuggestions,
  type HeroSuggestionPool,
} from "@/lib/catalogue/suggestions";
import { HERO_SUGGESTION_POOL } from "@/lib/homepage";
import { normalizeTyreSize } from "@/lib/search/tyre-size";

function kindCounts(pool: HeroSuggestionPool, seed: number) {
  const picked = pickHeroSuggestions(pool, seed);
  return {
    picked,
    category: picked.filter((item) => item.kind === "category").length,
    size: picked.filter((item) => item.kind === "size").length,
    name: picked.filter((item) => item.kind === "name").length,
  };
}

describe("hero suggestion pool", () => {
  it("draws categories from the six homepage ranges plus the two radial ranges", () => {
    expect(HERO_SUGGESTION_POOL.category.map((item) => item.label)).toEqual([
      "Motorcycle Tyres",
      "Three Wheeler Tyres",
      "Truck & Bus Tyres",
      "Agriculture Tyres",
      "Off-The-Road (OTR) Tyres",
      "Forklift Tyres",
      "Truck & Bus Radial Tyres",
      "Passenger Car Radial Tyres",
    ]);
  });

  it("uses only real sizes from the master dataset or the radial ranges", () => {
    const realSizes = new Set<string>();
    for (const pattern of CATALOGUE.patterns) {
      for (const variant of pattern.variants) {
        if (variant.public.size) {
          realSizes.add(variant.public.size);
        }
      }
    }
    for (const range of ["tbr", "pcr"] as const) {
      for (const pattern of RANGE_DATASETS[range].patterns) {
        for (const size of rangePatternSizes(pattern)) {
          realSizes.add(normalizeTyreSize(size) ?? size);
        }
      }
    }

    expect(HERO_SUGGESTION_POOL.size.length).toBeGreaterThan(0);
    for (const suggestion of HERO_SUGGESTION_POOL.size) {
      expect(realSizes.has(suggestion.label)).toBe(true);
    }
  });

  it("uses only real functional/display names from the master dataset", () => {
    const realNames = new Set<string>();
    for (const pattern of CATALOGUE.patterns) {
      const category = getCategory(pattern.categorySlug);
      if (category && pattern.displayName !== category.displayName) {
        realNames.add(pattern.displayName);
      }
    }

    expect(HERO_SUGGESTION_POOL.name.length).toBeGreaterThan(0);
    for (const suggestion of HERO_SUGGESTION_POOL.name) {
      expect(realNames.has(suggestion.label)).toBe(true);
    }
  });

  it("links every suggestion to a real canonical route", () => {
    const all = [
      ...HERO_SUGGESTION_POOL.category,
      ...HERO_SUGGESTION_POOL.size,
      ...HERO_SUGGESTION_POOL.name,
    ];
    const categorySlugs = CATEGORIES.map((category) => category.slug);

    for (const suggestion of all) {
      expect(suggestion.href.startsWith("/products/")).toBe(true);
      expect(suggestion.query.length).toBeGreaterThan(0);
      const slug = suggestion.href.split("/")[2] ?? "";
      const isCategoryRoute = (categorySlugs as readonly string[]).includes(
        slug,
      );
      const isRadialRoute = suggestion.href.startsWith(
        "/products/truck-bus-tire/",
      );
      expect(isCategoryRoute || isRadialRoute).toBe(true);
    }
  });

  it("never exposes a Pattern Code", () => {
    const all = [
      ...HERO_SUGGESTION_POOL.category,
      ...HERO_SUGGESTION_POOL.size,
      ...HERO_SUGGESTION_POOL.name,
    ];
    const codes = new Set<string>();
    for (const pattern of CATALOGUE.patterns) {
      codes.add(pattern.patternCode.toLowerCase());
    }
    for (const range of ["tbr", "pcr"] as const) {
      for (const pattern of RANGE_DATASETS[range].patterns) {
        codes.add(pattern.patternCode.toLowerCase());
      }
    }

    for (const suggestion of all) {
      expect(codes.has(suggestion.label.toLowerCase())).toBe(false);
      expect(codes.has(suggestion.query.toLowerCase())).toBe(false);
    }
  });
});

describe("pickHeroSuggestions", () => {
  it("always returns exactly three suggestions", () => {
    for (const seed of [0, 1, 2, 7, 42, 99]) {
      expect(pickHeroSuggestions(HERO_SUGGESTION_POOL, seed)).toHaveLength(
        HERO_SUGGESTION_COUNT,
      );
    }
  });

  it("returns one category, one size and one name", () => {
    for (const seed of [0, 3, 11, 25]) {
      const counts = kindCounts(HERO_SUGGESTION_POOL, seed);
      expect(counts.category).toBe(1);
      expect(counts.size).toBe(1);
      expect(counts.name).toBe(1);
    }
  });

  it("is deterministic for a given seed", () => {
    const first = pickHeroSuggestions(HERO_SUGGESTION_POOL, 5);
    const second = pickHeroSuggestions(HERO_SUGGESTION_POOL, 5);
    expect(first.map((item) => item.label)).toEqual(
      second.map((item) => item.label),
    );
  });

  it("rotates the set across successive seeds", () => {
    const signatures = new Set(
      [0, 1, 2, 3, 4, 5, 6, 7].map((seed) =>
        pickHeroSuggestions(HERO_SUGGESTION_POOL, seed)
          .map((item) => item.label)
          .join("|"),
      ),
    );
    expect(signatures.size).toBeGreaterThan(1);
  });
});

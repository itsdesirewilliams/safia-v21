import { describe, expect, it } from "vitest";

import { CATEGORY_ALIASES } from "@/lib/search/aliases";
import {
  cleanSearchText,
  normalizeSearchQuery,
} from "@/lib/search/normalize";
import type { SizeDictionary } from "@/lib/search/size";

function size(query: string, sizes?: SizeDictionary): string[] {
  return normalizeSearchQuery(query, sizes).sizeCandidates;
}

function categories(query: string) {
  return normalizeSearchQuery(query).categoryCandidates;
}

describe("text cleaning", () => {
  it("lower-cases, normalizes dashes and collapses whitespace", () => {
    expect(cleanSearchText("  Tuk–Tuk   750 16  ")).toBe("tuk-tuk 750 16");
    expect(cleanSearchText("need, 750/16\nplease")).toBe("need 750/16 please");
  });

  it("preserves size punctuation (dots, hyphens, slashes, x)", () => {
    expect(cleanSearchText("23.5-25")).toBe("23.5-25");
    expect(cleanSearchText("110/90-13")).toBe("110/90-13");
    expect(cleanSearchText("16X6-8")).toBe("16x6-8");
  });
});

describe("tyre size normalization", () => {
  const cases: Array<[string, string]> = [
    ["750-16", "7.50-16"],
    ["750 16", "7.50-16"],
    ["7 50 16", "7.50-16"],
    ["7.50 16", "7.50-16"],
    ["7.50-16", "7.50-16"],
    ["1000-16", "10.00-16"],
    ["1000 16", "10.00-16"],
    ["10 00 16", "10.00-16"],
    ["23.5-25", "23.5-25"],
    ["25-23.5", "23.5-25"],
    ["23.5 25", "23.5-25"],
    ["25 23.5", "23.5-25"],
  ];

  for (const [input, expected] of cases) {
    it(`"${input}" → ${expected}`, () => {
      expect(size(input)).toContain(expected);
    });
  }

  it("confirms candidates against the dataset, never inventing a size", () => {
    const empty = new Map<string, string>();
    expect(size("750 16", empty)).toEqual([]);
    expect(normalizeSearchQuery("750 16", empty).matchState).toBe("INVALID");

    const only = new Map([["23.5-25", "23.5-25"]]);
    expect(size("25-23.5", only)).toContain("23.5-25");
  });

  it("does not turn arbitrary numbers into plausible-looking sizes", () => {
    for (const input of ["789-43", "9999-99", "123-456"]) {
      const result = normalizeSearchQuery(input);
      expect(result.sizeCandidates).toEqual([]);
      expect(result.matchState).toBe("INVALID");
      expect(result.matchTerms).toEqual([]);
    }
  });
});

describe("category aliases", () => {
  const cases: Array<[string, string]> = [
    ["three wheeler", "three-wheeler"],
    ["three-wheeler", "three-wheeler"],
    ["3 wheeler", "three-wheeler"],
    ["3-wheeler", "three-wheeler"],
    ["tuk tuk", "three-wheeler"],
    ["tuk-tuk", "three-wheeler"],
    ["tuktuk", "three-wheeler"],
    ["auto rickshaw", "three-wheeler"],
    ["autorickshaw", "three-wheeler"],
    ["bajaj", "three-wheeler"],
    ["truck", "truck-bus"],
    ["lorry", "truck-bus"],
    ["bus", "truck-bus"],
    ["cv", "truck-bus"],
    ["tractor", "agriculture"],
    ["farm", "agriculture"],
    ["forklift", "forklift"],
    ["fork lift", "forklift"],
    ["otr", "otr"],
    ["off the road", "otr"],
    ["off-road", "otr"],
    ["earthmover", "otr"],
    ["motorcycle", "motorcycle"],
    ["motorbike", "motorcycle"],
    ["bike", "motorcycle"],
    ["two wheeler", "motorcycle"],
    ["2-wheeler", "motorcycle"],
  ];

  for (const [input, expected] of cases) {
    it(`"${input}" → ${expected}`, () => {
      expect(categories(input)).toContain(expected);
    });
  }

  it("does not match an alias inside a larger word", () => {
    expect(categories("business")).not.toContain("truck-bus");
    expect(categories("antibody")).not.toContain("three-wheeler");
  });

  it("strips alias digits so they cannot corrupt size parsing", () => {
    const result = normalizeSearchQuery("3 wheeler 750 16");
    expect(result.categoryCandidates).toContain("three-wheeler");
    expect(result.sizeCandidates).toContain("7.50-16");
  });
});

describe("mixed customer text", () => {
  it("extracts category + size from a messy sentence", () => {
    const result = normalizeSearchQuery("need 750 16 tractor");
    expect(result.categoryCandidates).toContain("agriculture");
    expect(result.sizeCandidates).toContain("7.50-16");
    // The alias word is captured as a category hint, not a loose token.
    expect(result.tokens).not.toContain("tractor");
    expect(result.tokens).toContain("750");
  });

  it("handles aliases and sizes together", () => {
    const tuk = normalizeSearchQuery("tuk tuk 750-16");
    expect(tuk.categoryCandidates).toContain("three-wheeler");
    expect(tuk.sizeCandidates).toContain("7.50-16");

    const bajaj = normalizeSearchQuery("bajaj 1000 16");
    expect(bajaj.categoryCandidates).toContain("three-wheeler");
    expect(bajaj.sizeCandidates).toContain("10.00-16");

    const otr = normalizeSearchQuery("otr 23.5 25");
    expect(otr.categoryCandidates).toContain("otr");
    expect(otr.sizeCandidates).toContain("23.5-25");
  });

  it("is case- and whitespace-insensitive", () => {
    const result = normalizeSearchQuery("  TUK-TUK   750 16  ");
    expect(result.normalizedQuery).toBe("tuk-tuk 750 16");
    expect(result.categoryCandidates).toContain("three-wheeler");
    expect(result.sizeCandidates).toContain("7.50-16");
    expect(result.normalizationApplied).toBe(true);
  });
});

describe("match states and confidence", () => {
  it("marks an already-canonical size as EXACT", () => {
    const result = normalizeSearchQuery("7.50-16");
    expect(result.matchState).toBe("EXACT");
    expect(result.confidence).toBe(1);
    expect(result.sizeCandidates).toContain("7.50-16");
  });

  it("marks a normalized size as NORMALIZED", () => {
    const result = normalizeSearchQuery("750-16");
    expect(result.matchState).toBe("NORMALIZED");
    expect(result.normalizationApplied).toBe(true);
  });

  it("marks a bare alias as ALIAS_MATCH", () => {
    expect(normalizeSearchQuery("tuk tuk").matchState).toBe("ALIAS_MATCH");
  });

  it("marks free text with no size or alias as FUZZY_MATCH", () => {
    expect(normalizeSearchQuery("random nonsense").matchState).toBe(
      "FUZZY_MATCH",
    );
  });

  it("marks an unconfirmable size as INVALID and empty", () => {
    const result = normalizeSearchQuery("789-43");
    expect(result.matchState).toBe("INVALID");
    expect(result.confidence).toBe(0);
    expect(result.sizeCandidates).toEqual([]);
    expect(result.matchTerms).toEqual([]);
  });

  it("marks an empty query as NO_MATCH", () => {
    const result = normalizeSearchQuery("   ");
    expect(result.matchState).toBe("NO_MATCH");
    expect(result.matchTerms).toEqual([]);
  });

  it("returns the canonical size as the first match term", () => {
    const result = normalizeSearchQuery("750-16");
    expect(result.matchTerms[0]).toBe("7.50-16");
  });
});

describe("alias dictionary shape", () => {
  it("only maps onto canonical category slugs", () => {
    const valid = new Set([
      "motorcycle",
      "three-wheeler",
      "truck-bus",
      "agriculture",
      "otr",
      "forklift",
      "tubes",
    ]);
    for (const alias of CATEGORY_ALIASES) {
      expect(valid.has(alias.categorySlug)).toBe(true);
      expect(alias.phrases.length).toBeGreaterThan(0);
    }
  });
});

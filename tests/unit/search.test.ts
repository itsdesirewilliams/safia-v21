import { describe, expect, it, vi } from "vitest";

import {
  MAX_SEARCH_LENGTH,
  normalizeSearchQuery,
  searchPatterns,
  type SearchClient,
} from "@/lib/catalogue/search";

const AGRICULTURE_ROW = {
  category_slug: "agriculture",
  category_display_name: "Agriculture Tyres",
  pattern_slug: "bias-tractor-tyres-tr-1042",
  pattern_code: "TR-1042",
  display_name: "BIAS TRACTOR TYRES",
  sizes: ["6.00-16", "6.50-16", "7.50-16"],
};

function fakeClient(
  data: unknown,
  error: { message: string } | null = null,
): SearchClient {
  return { rpc: vi.fn().mockResolvedValue({ data, error }) };
}

describe("normalizeSearchQuery", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeSearchQuery("  6.00-16  ")).toBe("6.00-16");
    expect(normalizeSearchQuery("TR  1042")).toBe("TR 1042");
  });

  it("treats missing input as empty", () => {
    expect(normalizeSearchQuery(null)).toBe("");
    expect(normalizeSearchQuery(undefined)).toBe("");
    expect(normalizeSearchQuery("   ")).toBe("");
  });

  it("caps the query length", () => {
    expect(normalizeSearchQuery("x".repeat(200))).toHaveLength(
      MAX_SEARCH_LENGTH,
    );
  });
});

describe("searchPatterns", () => {
  it("resolves a size match to a Pattern", async () => {
    const results = await searchPatterns(fakeClient([AGRICULTURE_ROW]), "6.00-16");

    expect(results).toEqual([
      {
        categorySlug: "agriculture",
        categoryDisplayName: "Agriculture Tyres",
        patternSlug: "bias-tractor-tyres-tr-1042",
        patternCode: "TR-1042",
        displayName: "BIAS TRACTOR TYRES",
        sizes: ["6.00-16", "6.50-16", "7.50-16"],
      },
    ]);
  });

  it("never yields a Variant: every result carries a pattern slug", async () => {
    const results = await searchPatterns(fakeClient([AGRICULTURE_ROW]), "TR-1042");
    expect(results).toHaveLength(1);
    expect(results[0].patternSlug).toBeTruthy();
  });

  it("does not query the database for a too-short query", async () => {
    const client = fakeClient([AGRICULTURE_ROW]);
    const results = await searchPatterns(client, "a");

    expect(results).toEqual([]);
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("degrades to no results on a transport error", async () => {
    const results = await searchPatterns(
      fakeClient(null, { message: "boom" }),
      "TR-1042",
    );
    expect(results).toEqual([]);
  });

  it("drops rows whose category is not canonical", async () => {
    const results = await searchPatterns(
      fakeClient([{ ...AGRICULTURE_ROW, category_slug: "spaceships" }]),
      "TR-1042",
    );
    expect(results).toEqual([]);
  });

  it("ignores malformed payloads", async () => {
    expect(await searchPatterns(fakeClient("nonsense"), "TR-1042")).toEqual([]);
    expect(await searchPatterns(fakeClient(null), "TR-1042")).toEqual([]);
  });
});

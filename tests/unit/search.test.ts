import { describe, expect, it, vi } from "vitest";

import {
  MAX_SEARCH_LENGTH,
  sanitizeQuery,
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

describe("sanitizeQuery", () => {
  it("trims, lower-cases and collapses whitespace", () => {
    expect(sanitizeQuery("  6.00-16  ")).toBe("6.00-16");
    expect(sanitizeQuery("TR  1042")).toBe("tr 1042");
  });

  it("treats missing input as empty", () => {
    expect(sanitizeQuery(null)).toBe("");
    expect(sanitizeQuery(undefined)).toBe("");
    expect(sanitizeQuery("   ")).toBe("");
  });

  it("caps the query length", () => {
    expect(sanitizeQuery("x".repeat(200))).toHaveLength(MAX_SEARCH_LENGTH);
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

  it("searches with the canonical size for a messy size input", async () => {
    const client = fakeClient([AGRICULTURE_ROW]);
    await searchPatterns(client, "750-16");

    expect(client.rpc).toHaveBeenCalledWith("search_patterns", {
      search: "7.50-16",
    });
  });

  it("searches by category slug when the query is a category alias", async () => {
    const client = fakeClient([AGRICULTURE_ROW]);
    await searchPatterns(client, "tractor");

    expect(client.rpc).toHaveBeenCalledWith("search_patterns", {
      search: "agriculture",
    });
  });

  it("never queries the database for an unconfirmable size", async () => {
    const client = fakeClient([AGRICULTURE_ROW]);
    const results = await searchPatterns(client, "789-43");

    expect(results).toEqual([]);
    expect(client.rpc).not.toHaveBeenCalled();
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

  it("ranks inferred-category results first", async () => {
    const client = fakeClient([
      { ...AGRICULTURE_ROW, category_slug: "truck-bus", pattern_slug: "t" },
      AGRICULTURE_ROW,
    ]);
    const results = await searchPatterns(client, "tractor 750 16");

    expect(results[0].categorySlug).toBe("agriculture");
  });

  it("ignores malformed payloads", async () => {
    expect(await searchPatterns(fakeClient("nonsense"), "TR-1042")).toEqual([]);
    expect(await searchPatterns(fakeClient(null), "TR-1042")).toEqual([]);
  });

  it("merges TBR range matches by size with the database results", async () => {
    const results = await searchPatterns(fakeClient([]), "295/80R22.5");

    expect(results[0]).toMatchObject({
      displayName: "295/80R22.5",
      categoryDisplayName: "Truck & Bus Radial Tyres",
      href: expect.stringMatching(
        /^\/products\/truck-bus-tire\/tbr-safeway\//,
      ),
    });
  });

  it("merges PCR range matches by size with the database results", async () => {
    const results = await searchPatterns(fakeClient([]), "205/65R15");

    expect(results[0]).toMatchObject({
      displayName: "205/65R15",
      categoryDisplayName: "Passenger Car Radial Tyres",
      href: expect.stringMatching(
        /^\/products\/truck-bus-tire\/pcr-safeway\//,
      ),
    });
  });

  it("still returns radial matches for a size-shaped query", async () => {
    const results = await searchPatterns(fakeClient([]), "11R22.5-16PR TL");

    expect(results.some((result) => result.displayName === "11R22.5")).toBe(
      true,
    );
  });

  it("drops a result that matched only a partial Pattern Code", async () => {
    const results = await searchPatterns(
      fakeClient([
        {
          category_slug: "motorcycle",
          category_display_name: "Motorcycle Tyres",
          pattern_slug: "motorcycle-tyres-sfm-101",
          pattern_code: "SFM-101",
          display_name: "MOTORCYCLE TYRES",
          sizes: ["2.75-17"],
        },
      ]),
      "fm",
    );

    expect(results).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";

import { searchRanges } from "@/lib/catalogue/range-search";

describe("radial range search — by size", () => {
  it("finds a TBR radial size and links to its range page", () => {
    const first = searchRanges("295/80R22.5")[0];
    expect(first).toMatchObject({
      displayName: "295/80R22.5",
      categoryDisplayName: "Truck & Bus Radial Tyres",
      href: expect.stringMatching(
        /^\/products\/truck-bus-tire\/tbr-safeway\//,
      ),
    });
  });

  it("finds a PCR radial size and links to its range page", () => {
    const first = searchRanges("205/65R15")[0];
    expect(first).toMatchObject({
      displayName: "205/65R15",
      categoryDisplayName: "Passenger Car Radial Tyres",
      href: expect.stringMatching(
        /^\/products\/truck-bus-tire\/pcr-safeway\//,
      ),
    });
  });

  it("finds a TBR radial size without an aspect ratio", () => {
    expect(searchRanges("11R22.5")[0]?.displayName).toBe("11R22.5");
  });

  it("resolves formatting variations to the same result", () => {
    const forms = [
      "295/80R22.5",
      "295/80 R22.5",
      "295-80R22.5",
      "295 80 22.5",
    ];
    const hrefs = forms.map((form) => searchRanges(form)[0]?.href);
    expect(new Set(hrefs).size).toBe(1);
    expect(hrefs[0]).toBeTruthy();
  });
});

describe("radial range search — by public name", () => {
  it("finds the TBR range by name", () => {
    const results = searchRanges("Truck & Bus Radial");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.categorySlug === "truck-bus")).toBe(true);
  });

  it("finds the PCR range by name", () => {
    const results = searchRanges("Passenger Car Radial");
    expect(results.length).toBeGreaterThan(0);
  });
});

describe("radial range search — public rules", () => {
  it("never matches a Pattern Code", () => {
    for (const code of ["FM18", "FM316", "RT3000", "RT6000"]) {
      expect(searchRanges(code), code).toEqual([]);
    }
  });

  it("never fabricates results", () => {
    expect(searchRanges("tubes")).toEqual([]);
    expect(searchRanges("Butyl")).toEqual([]);
    expect(searchRanges("TU-101")).toEqual([]);
    expect(searchRanges("zzzz")).toEqual([]);
  });

  it("ignores queries shorter than the minimum length", () => {
    expect(searchRanges("a")).toEqual([]);
  });
});

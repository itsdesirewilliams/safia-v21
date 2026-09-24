import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { CATEGORIES } from "@/lib/catalogue/categories";
import {
  getPattern,
  listPatternsByCategory,
  CATALOGUE,
} from "@/lib/catalogue/dataset";
import {
  normalizeMasterData,
  patternSlug,
  type MasterDataset,
} from "@/lib/catalogue/normalize";
import { slugify } from "@/lib/slug";

const RAW = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "supabase/master-product-data.json"),
    "utf8",
  ),
) as MasterDataset;

describe("catalogue normalization", () => {
  it("normalizes the raw master dataset into the shipped catalogue", () => {
    const normalized = normalizeMasterData(RAW);
    expect(normalized.patterns.map((pattern) => pattern.slug)).toEqual(
      CATALOGUE.patterns.map((pattern) => pattern.slug),
    );
  });

  it("exposes the seven canonical categories, with Tubes data deferred", () => {
    expect(CATALOGUE.categories.map((category) => category.slug)).toEqual(
      CATEGORIES.map((category) => category.slug),
    );

    const tubes = CATALOGUE.categories.find(
      (category) => category.slug === "tubes",
    );
    expect(tubes?.hasData).toBe(false);
    expect(listPatternsByCategory("tubes")).toHaveLength(0);
  });

  it("renames the source `name` to the customer-facing `displayName`", () => {
    const pattern = getPattern("agriculture", "bias-tractor-tyres-tr-1042");
    expect(pattern?.displayName).toBe("BIAS TRACTOR TYRES");
  });

  it("generates the slug from the display name plus the appended pattern code", () => {
    expect(slugify("Truck & Bus Tyres")).toBe("truck-bus-tyres");
    expect(patternSlug("BIAS TRACTOR TYRES", "TR-1042")).toBe(
      "bias-tractor-tyres-tr-1042",
    );

    const pattern = getPattern("agriculture", "bias-tractor-tyres-tr-1042");
    expect(pattern?.patternCode).toBe("TR-1042");
  });

  it("maps the master Forklift range onto the canonical forklift category", () => {
    const forklift = listPatternsByCategory("forklift");
    expect(forklift.map((pattern) => pattern.patternCode).sort()).toEqual([
      "FKL-555",
      "FKP-555",
    ]);
  });

  it("matches the authoritative catalogue totals", () => {
    expect(CATALOGUE.patterns).toHaveLength(55);
    const variants = CATALOGUE.patterns.reduce(
      (sum, pattern) => sum + pattern.variants.length,
      0,
    );
    expect(variants).toBe(215);
  });

  it("keeps only the public variant fields and never leaks pricing/shipping", () => {
    const pattern = getPattern("agriculture", "bias-tractor-tyres-tr-1042");
    const variant = pattern?.variants[0];

    expect(Object.keys(variant?.public ?? {}).sort()).toEqual(
      [
        "application",
        "plyRating",
        "rimWidthInch",
        "size",
        "tread",
        "ttTl",
        "tyreType",
      ].sort(),
    );

    const serialized = JSON.stringify(
      CATALOGUE.patterns.map((item) =>
        item.variants.map((entry) => entry.public),
      ),
    );
    expect(serialized).not.toMatch(/fob|container|usd|price/i);
  });

  it("retains weightKg as internal-only data", () => {
    const variant = getPattern(
      "agriculture",
      "bias-tractor-tyres-tr-1042",
    )?.variants[0];

    expect(variant?.weightKg).toBeTypeOf("number");
    expect(variant?.public).not.toHaveProperty("weightKg");
  });

  it("surfaces the Forklift solid fields (rim width, tread, tyre type)", () => {
    const solid = getPattern("forklift", "industrial-solid-tyres-fkl-555");
    const variant = solid?.variants.find(
      (entry) => entry.public.rimWidthInch !== null,
    );

    expect(variant?.public.rimWidthInch).toBeTruthy();
    expect(variant?.public.tread).toBeTruthy();
    expect(variant?.public.tyreType).toBeTruthy();
  });

  it("normalises blank source cells to null", () => {
    const pattern = getPattern("forklift", "industrial-forklift-tyres-fkp-555");
    const variant = pattern?.variants[0];
    expect(variant?.public.ttTl).toBeNull();
  });
});

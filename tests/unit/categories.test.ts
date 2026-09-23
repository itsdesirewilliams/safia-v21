import { describe, expect, it } from "vitest";

import { CATEGORIES, isCategorySlug } from "@/lib/catalogue/categories";

const EXPECTED_CATEGORIES: Record<string, string> = {
  motorcycle: "Motorcycle Tyres",
  "three-wheeler": "Three Wheeler Tyres",
  "truck-bus": "Truck & Bus Tyres",
  agriculture: "Agriculture Tyres",
  otr: "Off-The-Road (OTR) Tyres",
  forklift: "Forklift Tyres",
  tubes: "Tubes",
};

describe("canonical categories", () => {
  it("defines exactly the seven canonical categories", () => {
    expect(CATEGORIES.map((category) => category.slug).sort()).toEqual(
      Object.keys(EXPECTED_CATEGORIES).sort(),
    );
  });

  it("maps each slug to its canonical display name", () => {
    for (const category of CATEGORIES) {
      expect(category.displayName).toBe(EXPECTED_CATEGORIES[category.slug]);
    }
  });

  it("recognises canonical slugs only", () => {
    expect(isCategorySlug("motorcycle")).toBe(true);
    expect(isCategorySlug("3-wheeler")).toBe(false);
    expect(isCategorySlug("")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import {
  CATEGORIES,
  PRODUCT_MENU_ORDER,
} from "@/lib/catalogue/categories";

/**
 * The Products dropdown is a two-column grid filled row by row, so the single
 * ordered list below is exactly what produces the required column placement.
 */
describe("Products menu order", () => {
  it("lists all seven canonical ranges exactly once", () => {
    expect(PRODUCT_MENU_ORDER).toHaveLength(7);
    expect(new Set(PRODUCT_MENU_ORDER).size).toBe(7);
    expect([...PRODUCT_MENU_ORDER].sort()).toEqual(
      CATEGORIES.map((category) => category.slug).sort(),
    );
  });

  it("is not alphabetized", () => {
    expect(PRODUCT_MENU_ORDER).not.toEqual(
      [...PRODUCT_MENU_ORDER].sort(),
    );
  });

  it("places the required ranges in the left and right columns", () => {
    // `grid-cols-2` fills row by row: even indices land in the left column.
    const left = PRODUCT_MENU_ORDER.filter((_, index) => index % 2 === 0);
    const right = PRODUCT_MENU_ORDER.filter((_, index) => index % 2 === 1);

    expect(left).toEqual([
      "truck-bus",
      "agriculture",
      "forklift",
      "tubes",
    ]);
    expect(right).toEqual(["three-wheeler", "otr", "motorcycle"]);
  });

  it("keeps Truck & Bus first", () => {
    expect(PRODUCT_MENU_ORDER[0]).toBe("truck-bus");
  });
});

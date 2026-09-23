import { describe, expect, it } from "vitest";

import { CATEGORIES } from "@/lib/catalogue/categories";
import {
  CERTIFICATIONS,
  HOME_CATEGORY_CARDS,
  TESTIMONIALS,
} from "@/lib/homepage";
import { ROUTES } from "@/lib/routes";

const EXPECTED_CARD_SLUGS = [
  "motorcycle",
  "three-wheeler",
  "truck-bus",
  "agriculture",
  "otr",
  "forklift",
];

describe("homepage category cards", () => {
  it("shows exactly the six canonical categories, in order", () => {
    expect(HOME_CATEGORY_CARDS.map((card) => card.slug)).toEqual(
      EXPECTED_CARD_SLUGS,
    );
  });

  it("excludes Tubes (its data is deferred)", () => {
    expect(HOME_CATEGORY_CARDS.map((card) => card.slug)).not.toContain(
      "tubes",
    );
  });

  it("keeps Tubes in the Products navigation", () => {
    expect(CATEGORIES.map((category) => category.slug)).toContain("tubes");
  });

  it("links each card to its canonical category route", () => {
    for (const card of HOME_CATEGORY_CARDS) {
      expect(ROUTES.category(card.slug)).toBe(`/products/${card.slug}`);
      expect(card.blurb.length).toBeGreaterThan(0);
    }
  });
});

describe("homepage certifications", () => {
  it("only names supplied marks, each with a local asset path", () => {
    for (const certification of CERTIFICATIONS) {
      expect(certification.name.length).toBeGreaterThan(0);
      expect(
        certification.logo === null ||
          certification.logo.startsWith("/certifications/"),
      ).toBe(true);
    }
  });
});

describe("homepage testimonials", () => {
  it("only uses supplied testimonials, each with an author and location", () => {
    for (const testimonial of TESTIMONIALS) {
      expect(testimonial.quote.length).toBeGreaterThan(0);
      expect(testimonial.author.length).toBeGreaterThan(0);
      expect(testimonial.location.length).toBeGreaterThan(0);
    }
  });
});

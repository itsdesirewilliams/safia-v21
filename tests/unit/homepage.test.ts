import { describe, expect, it } from "vitest";

import { CATEGORIES } from "@/lib/catalogue/categories";
import { titleCasePhrase } from "@/lib/catalogue/suggestions";
import { countryCode, countryFlag } from "@/lib/contact/countries";
import {
  HERO_PLACEHOLDER_PHRASES,
  HERO_SUGGESTION_POOL,
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

describe("homepage testimonials", () => {
  it("ships three temporary sample testimonials, each with a resolved country code", () => {
    expect(TESTIMONIALS).toHaveLength(3);

    for (const testimonial of TESTIMONIALS) {
      expect(testimonial.quote.length).toBeGreaterThan(0);
      expect(testimonial.author.length).toBeGreaterThan(0);
      expect(testimonial.location.length).toBeGreaterThan(0);
      expect(testimonial.countryCode).toBe(countryCode(testimonial.location));
      expect(testimonial.countryCode).toMatch(/^[A-Z]{2}$/);
    }
  });
});

describe("homepage placeholder phrases", () => {
  it("draws every phrase from the real dataset suggestion pool", () => {
    const real = new Set([
      ...HERO_SUGGESTION_POOL.category.map((item) => item.label),
      ...HERO_SUGGESTION_POOL.size.map((item) => item.label),
      ...HERO_SUGGESTION_POOL.name.map((item) => titleCasePhrase(item.label)),
    ]);

    expect(HERO_PLACEHOLDER_PHRASES.length).toBeGreaterThan(0);
    for (const phrase of HERO_PLACEHOLDER_PHRASES) {
      expect(real.has(phrase)).toBe(true);
    }
  });

  it("represents a category, a real size and a functional name", () => {
    const hasCategory = HERO_PLACEHOLDER_PHRASES.some((phrase) =>
      HERO_SUGGESTION_POOL.category.some((item) => item.label === phrase),
    );
    const hasSize = HERO_PLACEHOLDER_PHRASES.some((phrase) =>
      HERO_SUGGESTION_POOL.size.some((item) => item.label === phrase),
    );
    const hasName = HERO_PLACEHOLDER_PHRASES.some((phrase) =>
      HERO_SUGGESTION_POOL.name.some(
        (item) => titleCasePhrase(item.label) === phrase,
      ),
    );

    expect(hasCategory).toBe(true);
    expect(hasSize).toBe(true);
    expect(hasName).toBe(true);
  });
});

describe("titleCasePhrase", () => {
  it("title-cases words but leaves numeric/code tokens intact", () => {
    expect(titleCasePhrase("BIAS TRACTOR TYRES")).toBe("Bias Tractor Tyres");
    expect(titleCasePhrase("DRIVE WHEEL TYRES (R2)")).toBe(
      "Drive Wheel Tyres (R2)",
    );
    expect(titleCasePhrase("MULTIPURPOSE TYRES (MPT-01)")).toBe(
      "Multipurpose Tyres (MPT-01)",
    );
  });
});

describe("countryFlag", () => {
  it("resolves a flag emoji by country name and degrades safely", () => {
    expect(countryFlag("Brazil")).toBe("🇧🇷");
    expect(countryFlag("United Arab Emirates")).toBe("🇦🇪");
    expect(countryFlag("Czechia")).toBe("🇨🇿");
    expect(countryFlag("Not A Country")).toBe("");
  });
});

describe("countryCode", () => {
  it("resolves an ISO alpha-2 code deterministically by country name", () => {
    expect(countryCode("Brazil")).toBe("BR");
    expect(countryCode("United Arab Emirates")).toBe("AE");
    expect(countryCode("Czechia")).toBe("CZ");
    expect(countryCode("  india ")).toBe("IN");
    expect(countryCode("Not A Country")).toBeNull();
  });
});

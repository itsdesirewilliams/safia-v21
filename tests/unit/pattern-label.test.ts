import { describe, expect, it } from "vitest";

import { patternEyebrow } from "@/lib/catalogue/pattern-label";

describe("pattern eyebrow", () => {
  it("uses the functional source name where it differs from the category", () => {
    expect(patternEyebrow("BIAS TRACTOR TYRES", "Agriculture Tyres")).toBe(
      "BIAS TRACTOR TYRES",
    );
    expect(patternEyebrow("EARTHMOVER (OT-E3) TYRES", "Off-The-Road (OTR) Tyres")).toBe(
      "EARTHMOVER (OT-E3) TYRES",
    );
  });

  it("falls back to the category name when the display name is the category", () => {
    expect(patternEyebrow("Motorcycle Tyres", "Motorcycle Tyres")).toBe(
      "Motorcycle Tyres",
    );
    expect(patternEyebrow("Truck & Bus Tyres", "Truck & Bus Tyres")).toBe(
      "Truck & Bus Tyres",
    );
  });

  it("falls back to the category name when there is no display name", () => {
    expect(patternEyebrow("   ", "Three Wheeler Tyres")).toBe(
      "Three Wheeler Tyres",
    );
  });
});

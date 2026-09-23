import { describe, expect, it } from "vitest";

import { validateMediaMetadata } from "@/lib/media/metadata";

describe("validateMediaMetadata", () => {
  it("treats every optional field as absent when empty", () => {
    const result = validateMediaMetadata({
      alt: "   ",
      caption: "",
      patternCode: null,
      categorySlug: undefined,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        alt: null,
        caption: null,
        patternCode: null,
        categorySlug: null,
      },
    });
  });

  it("trims and keeps supplied alt and caption", () => {
    const result = validateMediaMetadata({
      alt: "  Tractor rear tyre  ",
      caption: "  Bias tractor tyres ",
    });

    expect(result).toEqual({
      ok: true,
      value: {
        alt: "Tractor rear tyre",
        caption: "Bias tractor tyres",
        patternCode: null,
        categorySlug: null,
      },
    });
  });

  it("rejects alt text longer than the accessibility limit", () => {
    const result = validateMediaMetadata({ alt: "a".repeat(301) });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.alt).toBeTruthy();
    }
  });

  it("rejects a caption longer than the presentation limit", () => {
    const result = validateMediaMetadata({ caption: "a".repeat(501) });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.caption).toBeTruthy();
    }
  });

  it("accepts a canonical category association", () => {
    const result = validateMediaMetadata({
      categorySlug: "truck-bus",
      patternCode: "TR-1042",
    });

    expect(result).toEqual({
      ok: true,
      value: {
        alt: null,
        caption: null,
        patternCode: "TR-1042",
        categorySlug: "truck-bus",
      },
    });
  });

  it("rejects a category that is not in the canonical dataset", () => {
    const result = validateMediaMetadata({ categorySlug: "spaceships" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.categorySlug).toBeTruthy();
    }
  });

  it("rejects a pattern code with invalid characters", () => {
    const result = validateMediaMetadata({ patternCode: "TR 1042; drop" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.patternCode).toBeTruthy();
    }
  });
});

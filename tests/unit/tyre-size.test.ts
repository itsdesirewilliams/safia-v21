import { describe, expect, it } from "vitest";

import { CATALOGUE, catalogueSizeDictionary } from "@/lib/catalogue/dataset";
import { normalizeTyreSize } from "@/lib/search/tyre-size";

describe("normalizeTyreSize — radial equivalents", () => {
  const equivalents = [
    "295/80R22.5",
    "295/80 R22.5",
    "295 / 80 R 22.5",
    "295-80R22.5",
    "295-80 R22.5",
    "295 80 R 22.5",
    "295 80 22.5",
    "29580R225",
    "29580225",
    "295/80r22.5",
  ];

  it("collapses every unambiguous spelling to one canonical key", () => {
    const keys = equivalents.map((value) => normalizeTyreSize(value));
    expect(keys).toEqual(equivalents.map(() => "295/80R22.5"));
  });

  it("keeps metric sizes without an aspect ratio", () => {
    expect(normalizeTyreSize("11R22.5")).toBe("11R22.5");
    expect(normalizeTyreSize("11r22.5")).toBe("11R22.5");
    expect(normalizeTyreSize("12.00R24")).toBe("12R24");
  });

  it("collapses compact metric forms", () => {
    expect(normalizeTyreSize("205/65R15")).toBe("205/65R15");
    expect(normalizeTyreSize("205 65 15")).toBe("205/65R15");
    expect(normalizeTyreSize("2056515")).toBe("205/65R15");
  });
});

describe("normalizeTyreSize — non-radial equivalents", () => {
  it("collapses the bias separator variations", () => {
    for (const value of ["6.50-16", "6.50 16", "6.50/16"]) {
      expect(normalizeTyreSize(value)).toBe("6.5-16");
    }
    for (const value of ["7.50-16", "7.50 16"]) {
      expect(normalizeTyreSize(value)).toBe("7.5-16");
    }
  });

  it("collapses agricultural bias sizes", () => {
    expect(normalizeTyreSize("12.4-24")).toBe("12.4-24");
    expect(normalizeTyreSize("12.4 24")).toBe("12.4-24");
  });

  it("keeps letter-prefixed sizes", () => {
    expect(normalizeTyreSize("11L-15")).toBe("11L-15");
    expect(normalizeTyreSize("9.5L-15")).toBe("9.5L-15");
  });
});

describe("normalizeTyreSize — never merges distinct sizes", () => {
  it("keeps rim diameter significant", () => {
    expect(normalizeTyreSize("205/65R15")).not.toBe(
      normalizeTyreSize("205/65R16"),
    );
    expect(normalizeTyreSize("6.50-16")).not.toBe(normalizeTyreSize("6.50-15"));
  });

  it("keeps aspect ratio significant", () => {
    expect(normalizeTyreSize("295/80R22.5")).not.toBe(
      normalizeTyreSize("295/75R22.5"),
    );
  });
});

describe("normalizeTyreSize — malformed input", () => {
  it("returns null for text that is not a size", () => {
    expect(normalizeTyreSize("")).toBeNull();
    expect(normalizeTyreSize("hello")).toBeNull();
    expect(normalizeTyreSize("tractor")).toBeNull();
    expect(normalizeTyreSize("truck & bus")).toBeNull();
  });

  it("never resolves a malformed size to a real catalogue value", () => {
    const dictionary = catalogueSizeDictionary();
    for (const value of ["789-43", "9999-99", "123-456", "zzz"]) {
      const key = normalizeTyreSize(value);
      if (key) {
        expect(dictionary.has(key)).toBe(false);
      }
    }
  });
});

describe("normalizeTyreSize — catalogue round-trip", () => {
  it("keys every normalizable stored size by its canonical form", () => {
    const dictionary = catalogueSizeDictionary();
    for (const pattern of CATALOGUE.patterns) {
      for (const variant of pattern.variants) {
        const size = variant.public.size;
        if (!size) {
          continue;
        }
        const canonical = normalizeTyreSize(size);
        if (canonical) {
          expect(dictionary.has(canonical), `${size} → ${canonical}`).toBe(true);
        }
      }
    }
  });
});

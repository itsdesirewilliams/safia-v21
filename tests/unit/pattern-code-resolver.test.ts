import { describe, expect, it } from "vitest";

import { patternDirectory } from "@/lib/catalogue/pattern-directory";
import {
  lookupPatternCode,
  patternLookupKey,
  planPatternImageFiles,
  type PatternImageDirectoryEntry,
} from "@/lib/media/pattern-image-batch";

const DIRECTORY = patternDirectory();

function entryFor(code: string): PatternImageDirectoryEntry | undefined {
  return DIRECTORY.find((entry) => entry.patternCode === code);
}

describe("catalogue-wide pattern directory", () => {
  it("derives entries from master, TBR and PCR (no hardcoded list)", () => {
    // A Nylon/master code, a TBR code and a PCR code all resolve.
    expect(entryFor("POWERMINER")).toBeTruthy();
    expect(entryFor("FM06")).toBeTruthy();
    expect(entryFor("FM316")).toBeTruthy();

    // The TBR/PCR counts come from the data, not a literal in this file.
    const tbr = DIRECTORY.filter((entry) => entry.range === "TBR");
    const pcr = DIRECTORY.filter((entry) => entry.range === "PCR");
    expect(tbr.length).toBe(34);
    expect(pcr.length).toBe(11);
  });
});

describe("canonical resolution — TBR", () => {
  for (const code of ["FM06", "FM07", "FM18", "FM985"]) {
    it(`resolves ${code} to the Truck & Bus Radial range`, () => {
      const lookup = lookupPatternCode(code, DIRECTORY);
      expect(lookup.status).toBe("matched");
      if (lookup.status === "matched") {
        expect(lookup.entry.patternCode).toBe(code);
        expect(lookup.entry.range).toBe("TBR");
        expect(lookup.entry.categorySlug).toBe("truck-bus");
        expect(lookup.entry.categoryName).toBe("Truck & Bus Radial");
      }
    });
  }
});

describe("canonical resolution — PCR", () => {
  for (const code of ["FM316", "FM601+", "RT3000"]) {
    it(`resolves ${code} to the Passenger Car Radial range`, () => {
      const lookup = lookupPatternCode(code, DIRECTORY);
      expect(lookup.status).toBe("matched");
      if (lookup.status === "matched") {
        expect(lookup.entry.patternCode).toBe(code);
        expect(lookup.entry.range).toBe("PCR");
        expect(lookup.entry.categoryName).toBe("Passenger Car Radial");
      }
    });
  }
});

describe("canonical resolution — existing Nylon catalogue", () => {
  it("still resolves a known Nylon Pattern Code", () => {
    const lookup = lookupPatternCode("POWERMINER", DIRECTORY);
    expect(lookup.status).toBe("matched");
    if (lookup.status === "matched") {
      expect(lookup.entry.range).toBe("Nylon");
      expect(lookup.entry.categorySlug).toBe("truck-bus");
    }
  });

  it("still resolves a hyphenated Nylon Pattern Code", () => {
    expect(lookupPatternCode("SFM-101", DIRECTORY).status).toBe("matched");
  });
});

describe("filename aliases resolve to the canonical code", () => {
  const cases: ReadonlyArray<[string, string]> = [
    ["FM06.webp", "FM06"],
    ["fm06.webp", "FM06"],
    ["FM-06.webp", "FM06"],
    ["fm-06.webp", "FM06"],
    ["FM 06.webp", "FM06"],
    ["FM07.webp", "FM07"],
    ["fm-07.webp", "FM07"],
    ["fm-18.webp", "FM18"],
    ["fm-19.webp", "FM19"],
    ["fm-59.webp", "FM59"],
    ["fm-985.webp", "FM985"],
    ["FM19+.webp", "FM19+"],
    ["FM19-PLUS.webp", "FM19+"],
    ["fm19-plus.webp", "FM19+"],
    ["FM-19-PLUS.webp", "FM19+"],
    ["FM 19 PLUS.webp", "FM19+"],
    ["FM601+.webp", "FM601+"],
    ["FM601-PLUS.webp", "FM601+"],
    ["fm601-plus.webp", "FM601+"],
    ["FM-601-PLUS.webp", "FM601+"],
    ["FM316.webp", "FM316"],
    ["fm-316.webp", "FM316"],
    ["RT3000.webp", "RT3000"],
    ["rt-3000.webp", "RT3000"],
  ];

  for (const [fileName, expected] of cases) {
    it(`${fileName} → ${expected}`, () => {
      const [plan] = planPatternImageFiles([fileName], DIRECTORY, new Set());
      expect(plan.status).toBe("ready");
      expect(plan.code).toBe(expected);
      expect(plan.entry?.patternCode).toBe(expected);
    });
  }

  it("keeps the canonical code, never the filename form", () => {
    const [plan] = planPatternImageFiles(["fm-601-plus.webp"], DIRECTORY, new Set());
    expect(plan.code).toBe("FM601+");
    expect(plan.code).not.toBe("fm-601-plus");
  });
});

/**
 * The Admin preview renders exactly the fields of a plan (`code`, `entry`), so
 * planning against the real catalogue directory is the preview path.
 */
describe("admin preview path (real catalogue directory)", () => {
  const previews: ReadonlyArray<[string, string, string]> = [
    ["fm-18.webp", "FM18", "Truck & Bus Radial"],
    ["fm-19-plus.webp", "FM19+", "Truck & Bus Radial"],
    ["fm-06.webp", "FM06", "Truck & Bus Radial"],
    ["fm-316.webp", "FM316", "Passenger Car Radial"],
    ["fm-601-plus.webp", "FM601+", "Passenger Car Radial"],
    ["rt-3000.webp", "RT3000", "Passenger Car Radial"],
    ["powerminer.webp", "POWERMINER", "Truck & Bus Tyres"],
  ];

  for (const [fileName, code, category] of previews) {
    it(`${fileName} previews as ${code} / ${category}`, () => {
      const [plan] = planPatternImageFiles([fileName], DIRECTORY, new Set());
      expect(plan.status).toBe("ready");
      expect(plan.code).toBe(code);
      expect(plan.entry?.patternCode).toBe(code);
      expect(plan.entry?.categoryName).toBe(category);
    });
  }
});

describe("patternLookupKey", () => {
  it("folds separators and PLUS aliases to one key", () => {
    for (const value of ["FM06", "fm-06", "FM 06", "fm_06"]) {
      expect(patternLookupKey(value)).toBe("FM06");
    }
    for (const value of [
      "FM19+",
      "fm19-plus",
      "FM-19-PLUS",
      "FM 19 PLUS",
      "fm_19_plus",
    ]) {
      expect(patternLookupKey(value)).toBe("FM19+");
    }
  });
});

describe("safety — never manufacture a Pattern Code", () => {
  it("does not resolve a code that is not in the catalogue", () => {
    for (const fileName of [
      "FM999.webp",
      "fm-999.webp",
      "FAKE06.webp",
      "FAKE-06.webp",
    ]) {
      const [plan] = planPatternImageFiles([fileName], DIRECTORY, new Set());
      expect(plan.status, fileName).toBe("failed");
      expect(plan.reason, fileName).toBe("Pattern Code not found");
    }
  });

  it("reports ambiguity instead of silently choosing", () => {
    const ambiguous: PatternImageDirectoryEntry[] = [
      {
        patternCode: "AB-12",
        displayName: "A",
        categorySlug: "truck-bus",
        categoryName: "A",
        range: "TBR",
      },
      {
        patternCode: "AB12",
        displayName: "B",
        categorySlug: "truck-bus",
        categoryName: "B",
        range: "PCR",
      },
    ];
    const lookup = lookupPatternCode("ab-12", ambiguous);
    expect(lookup.status).toBe("ambiguous");

    const [plan] = planPatternImageFiles(["ab-12.webp"], ambiguous, new Set());
    expect(plan.status).toBe("failed");
    expect(plan.reason).toContain("Ambiguous Pattern Code");
  });

  it("does not collide unrelated canonical codes", () => {
    const keys = DIRECTORY.map((entry) => patternLookupKey(entry.patternCode));
    expect(new Set(keys).size).toBe(DIRECTORY.length);
  });
});

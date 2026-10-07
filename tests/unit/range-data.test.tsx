import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RangeSpecTable } from "@/components/catalogue/range-spec-table";
import {
  getRangePattern,
  listRangePatterns,
  rangeApplication,
  rangePatternToNormalized,
  RANGE_DATASETS,
  type RangeVariant,
} from "@/lib/catalogue/range-data";
import { ROUTES } from "@/lib/routes";

const PUBLIC_KEYS = ["application", "cc", "internal", "liSr", "size"];

describe("TBR dataset", () => {
  const patterns = listRangePatterns("tbr");

  it("matches the source totals", () => {
    expect(patterns).toHaveLength(34);
    const variants = patterns.reduce(
      (sum, pattern) => sum + pattern.variants.length,
      0,
    );
    expect(variants).toBe(71);
  });

  it("uses the FIREMAX FM code as the canonical Pattern Code", () => {
    for (const pattern of patterns) {
      expect(pattern.patternCode).toMatch(/^FM/);
    }
    expect(patterns.map((pattern) => pattern.patternCode)).toContain("FM18");
  });

  it("gives every pattern a unique slug (FM19+ does not collide with FM19)", () => {
    const slugs = [...listRangePatterns("tbr"), ...listRangePatterns("pcr")].map(
      (pattern) => pattern.slug,
    );
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(getRangePattern("tbr", "fm19-plus")?.patternCode).toBe("FM19+");
    expect(getRangePattern("tbr", "fm19")?.patternCode).toBe("FM19");
    expect(getRangePattern("pcr", "fm601-plus")?.patternCode).toBe("FM601+");
  });

  it("applies the agreed category-level application", () => {
    expect(rangeApplication("tbr")).toBe("Truck & Bus");
    for (const pattern of patterns) {
      for (const variant of pattern.variants) {
        expect(variant.application).toBe("Truck & Bus");
      }
    }
  });

  it("takes CC from the source QTY/40HQ and LI/SR from the source", () => {
    const fm18 = getRangePattern("tbr", "fm18");
    const first = fm18?.variants[0];
    expect(first?.size).toBe("7.50R16LT-16PR TL");
    expect(first?.liSr).toBe("125/121L");
    expect(first?.cc).toBe(650);
  });

  it("exposes only public fields on a variant", () => {
    const variant = listRangePatterns("tbr")[0].variants[0];
    expect(Object.keys(variant).sort()).toEqual(PUBLIC_KEYS);
  });
});

describe("PCR dataset", () => {
  const patterns = listRangePatterns("pcr");

  it("matches the canonical ORDER SHEET totals", () => {
    expect(patterns).toHaveLength(11);
    const variants = patterns.reduce(
      (sum, pattern) => sum + pattern.variants.length,
      0,
    );
    expect(variants).toBe(443);
  });

  it("keeps the source PCR Pattern Codes (including RT codes)", () => {
    expect(patterns.map((pattern) => pattern.patternCode)).toEqual([
      "FM316",
      "FM913",
      "FM916",
      "FM501",
      "FM518",
      "FM601",
      "FM601+",
      "FM523",
      "RT3000",
      "RT6000",
      "FM923",
    ]);
  });

  it("applies the agreed category-level application", () => {
    expect(rangeApplication("pcr")).toBe("Passenger Car");
    for (const pattern of patterns) {
      for (const variant of pattern.variants) {
        expect(variant.application).toBe("Passenger Car");
      }
    }
  });

  it("takes CC from the source QTY/40HQ and LI/SR from the source", () => {
    const first = getRangePattern("pcr", "fm316")?.variants[0];
    expect(first?.size).toBe("155/65R13");
    expect(first?.liSr).toBe("73T");
    expect(first?.cc).toBe(2300);
  });
});

describe("range accessors", () => {
  it("resolves patterns by slug and rejects unknown slugs", () => {
    expect(getRangePattern("tbr", "fm18")?.patternCode).toBe("FM18");
    expect(getRangePattern("pcr", "rt3000")?.patternCode).toBe("RT3000");
    expect(getRangePattern("tbr", "not-a-pattern")).toBeUndefined();
    expect(getRangePattern("pcr", "fm18")).toBeUndefined();
  });

  it("adapts a pattern for the shared Pattern card", () => {
    const normalized = rangePatternToNormalized(
      listRangePatterns("tbr")[0],
    );
    expect(normalized.categorySlug).toBe("truck-bus");
    expect(normalized.patternCode).toBe("FM18");
    expect(normalized.variants[0].public.size).toBe("7.50R16LT-16PR TL");
  });

  it("keeps TBR and PCR as separate datasets", () => {
    expect(RANGE_DATASETS.tbr.range).toBe("tbr");
    expect(RANGE_DATASETS.pcr.range).toBe("pcr");
  });

  it("exposes the PCR range route", () => {
    expect(ROUTES.pcrSafeway).toBe("/products/truck-bus-tire/pcr-safeway");
    expect(ROUTES.pcrPattern("fm316")).toBe(
      "/products/truck-bus-tire/pcr-safeway/fm316",
    );
  });
});

describe("public specification table", () => {
  const variant: RangeVariant = {
    size: "11R22.5-16PR TL",
    application: "Truck & Bus",
    liSr: "146/143L",
    cc: 280,
    internal: { fobUsd: 88, orderQty: null, fillerSize: null },
  };

  it("shows Size, Application, LI/SR and CC", () => {
    const html = renderToStaticMarkup(
      <RangeSpecTable variants={[variant]} />,
    );
    for (const header of ["Size", "Application", "LI/SR", "CC"]) {
      expect(html).toContain(header);
    }
    expect(html).toContain("Truck &amp; Bus");
    expect(html).toContain("146/143L");
    expect(html).toContain("280");
  });

  it("never renders commercial fields", () => {
    const html = renderToStaticMarkup(
      <RangeSpecTable variants={[variant]} />,
    );
    expect(html).not.toMatch(/fob|usd|40HQ|filler|total amount/i);
  });
});

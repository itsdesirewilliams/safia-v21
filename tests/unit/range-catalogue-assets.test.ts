import { describe, expect, it } from "vitest";

import { readRangeCatalogueLandscapeImages } from "@/lib/media/range-catalogue-assets";

describe("range catalogue landscape discovery", () => {
  it("discovers the TBR pages in natural page order", () => {
    const urls = readRangeCatalogueLandscapeImages("tbr");

    expect(urls.length).toBeGreaterThan(0);
    expect(urls[0]).toBe("/assets/catalogue/tbr/1_Im0.webp");
    expect(
      urls.every((url) => url.startsWith("/assets/catalogue/tbr/")),
    ).toBe(true);
    expect(urls.every((url) => url.endsWith(".webp"))).toBe(true);
  });

  it("orders multi-digit pages naturally (9 before 10)", () => {
    const urls = readRangeCatalogueLandscapeImages("tbr");
    const nine = urls.indexOf("/assets/catalogue/tbr/9_Im0.webp");
    const ten = urls.indexOf("/assets/catalogue/tbr/10_Im0.webp");

    expect(nine).toBeGreaterThanOrEqual(0);
    expect(ten).toBeGreaterThan(nine);
  });

  it("discovers the PCR pages separately from TBR", () => {
    const urls = readRangeCatalogueLandscapeImages("pcr");

    expect(urls.length).toBeGreaterThan(0);
    expect(urls[0]).toBe("/assets/catalogue/pcr/1_Im0.webp");
    expect(
      urls.every((url) => url.startsWith("/assets/catalogue/pcr/")),
    ).toBe(true);
  });
});

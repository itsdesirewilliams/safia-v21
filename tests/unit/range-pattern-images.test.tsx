import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// The range index pages read locale + the media layer from the request. Mock
// both so the page renders deterministically with a known image association.
vi.mock("@/lib/i18n/server", async () => {
  const { en } = await import("@/lib/i18n/dictionaries/en");
  return {
    getDictionary: async () => en,
    getLocale: async () => "en",
  };
});

const FM166_URL =
  "https://cdn.example.test/storage/v1/object/public/product-images/patterns/fm166/a.webp";
const FM316_URL =
  "https://cdn.example.test/storage/v1/object/public/product-images/patterns/fm316/a.webp";

vi.mock("@/lib/media/pattern-images-server", () => ({
  listPatternImageUrls: async () =>
    new Map<string, string>([
      ["FM166", FM166_URL],
      ["FM316", FM316_URL],
    ]),
  getPatternImageUrl: async () => null,
}));

// Breadcrumbs is an async server component; the legacy string renderer cannot
// render a suspended tree, and it is irrelevant to the image wiring under test.
vi.mock("@/components/catalogue/breadcrumbs", () => ({
  Breadcrumbs: () => null,
}));

import PcrSafewayPage from "@/app/(site)/products/truck-bus-tire/pcr-safeway/page";
import TbrSafewayPage from "@/app/(site)/products/truck-bus-tire/tbr-safeway/page";
import { listRangePatterns } from "@/lib/catalogue/range-data";

describe("TBR index pattern images", () => {
  it("renders the uploaded image for a pattern that has one", async () => {
    const html = renderToStaticMarkup(await TbrSafewayPage());
    expect(html).toContain(FM166_URL);
  });

  it("falls back to the neutral placeholder for a pattern with no image", async () => {
    const html = renderToStaticMarkup(await TbrSafewayPage());
    // FM166 has an image; every other TBR pattern has none and must fall back.
    expect(html).toContain("Pattern image coming soon");
  });
});

describe("PCR index pattern images", () => {
  it("renders the uploaded image for a pattern that has one", async () => {
    const html = renderToStaticMarkup(await PcrSafewayPage());
    expect(html).toContain(FM316_URL);
  });
});

describe("TBR temporary pattern exclusion", () => {
  it("hides FM57 from the public listing", async () => {
    const html = renderToStaticMarkup(await TbrSafewayPage());
    expect(html).not.toContain(">FM57<");
  });

  it("leaves every other TBR pattern listed", async () => {
    const html = renderToStaticMarkup(await TbrSafewayPage());
    expect(html).toContain(">FM18<");
    expect(html).toContain(">FM166<");
  });

  it("keeps FM57 in the underlying TBR data", () => {
    expect(
      listRangePatterns("tbr").some(
        (pattern) => pattern.patternCode === "FM57",
      ),
    ).toBe(true);
  });
});

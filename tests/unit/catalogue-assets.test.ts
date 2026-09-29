import { describe, expect, it } from "vitest";

import {
  CATALOGUE_ASSET_ROOT,
  discoverCataloguePdf,
  isCatalogueDocument,
} from "@/lib/media/catalogue-assets";

describe("catalogue document discovery", () => {
  it("accepts only PDFs", () => {
    expect(isCatalogueDocument("Safeway Tyre Catalogue.pdf")).toBe(true);
    expect(isCatalogueDocument("CATALOGUE.PDF")).toBe(true);
    expect(isCatalogueDocument("cover.png")).toBe(false);
    expect(isCatalogueDocument("readme")).toBe(false);
  });

  it("resolves the supplied PDF to its public URL, percent-encoded", () => {
    expect(discoverCataloguePdf(["Safeway Tyre Catalogue.pdf"])).toBe(
      `${CATALOGUE_ASSET_ROOT}/Safeway%20Tyre%20Catalogue.pdf`,
    );
  });

  it("returns null when no catalogue document is supplied", () => {
    expect(discoverCataloguePdf(["cover.png", "notes.txt"])).toBeNull();
    expect(discoverCataloguePdf([])).toBeNull();
  });
});

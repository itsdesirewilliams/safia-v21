import { describe, expect, it } from "vitest";

import {
  CATALOGUE_HEADER_ASSET,
  CATALOGUE_HEADER_HEIGHT,
  CATALOGUE_HEADER_WIDTH,
  readCatalogueHeaderImage,
} from "@/lib/media/catalogue-visual-assets";

describe("catalogue-header graphic", () => {
  it("points at the fixed supplied asset, never the media system", () => {
    expect(CATALOGUE_HEADER_ASSET).toBe("/assets/catalogue-header.png");
    expect(CATALOGUE_HEADER_ASSET.startsWith("/assets/")).toBe(true);
    expect(CATALOGUE_HEADER_ASSET).not.toContain("supabase");
  });

  it("exposes the graphic's natural pixel size", () => {
    expect(CATALOGUE_HEADER_WIDTH).toBeGreaterThan(0);
    expect(CATALOGUE_HEADER_HEIGHT).toBeGreaterThan(0);
  });

  it("resolves to the asset URL when the supplied file is present", () => {
    // The graphic ships with the repo, so it resolves; if it were removed the
    // loader degrades to `null` and the placeholder remains.
    const image = readCatalogueHeaderImage();
    expect(image === null || image === CATALOGUE_HEADER_ASSET).toBe(true);
    expect(image).toBe(CATALOGUE_HEADER_ASSET);
  });
});

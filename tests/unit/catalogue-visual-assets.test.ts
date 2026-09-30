import { describe, expect, it } from "vitest";

import {
  discoverExploreCatalogueImage,
  EXPLORE_CATALOGUE_ASSET_ROOT,
  isExploreCatalogueImage,
  readExploreCatalogueImage,
} from "@/lib/media/catalogue-visual-assets";

describe("explore catalogue image formats", () => {
  it("accepts web images and ignores everything else", () => {
    for (const filename of ["a.webp", "a.jpg", "a.jpeg", "a.png", "a.avif"]) {
      expect(isExploreCatalogueImage(filename)).toBe(true);
    }
    for (const filename of ["a.svg", "a.pdf", "a.mp4", "README"]) {
      expect(isExploreCatalogueImage(filename)).toBe(false);
    }
  });
});

describe("explore catalogue image discovery", () => {
  it("returns the first supported image, naturally ordered", () => {
    expect(
      discoverExploreCatalogueImage(["cover-10.png", "cover-2.png", "notes.pdf"]),
    ).toBe(`${EXPLORE_CATALOGUE_ASSET_ROOT}/cover-2.png`);
  });

  it("returns null when nothing supported is supplied", () => {
    expect(discoverExploreCatalogueImage(["notes.pdf"])).toBeNull();
    expect(discoverExploreCatalogueImage([])).toBeNull();
  });

  it("reads the repository folder, or null while it is empty", () => {
    const image = readExploreCatalogueImage();
    expect(
      image === null || image.startsWith(`${EXPLORE_CATALOGUE_ASSET_ROOT}/`),
    ).toBe(true);
  });
});

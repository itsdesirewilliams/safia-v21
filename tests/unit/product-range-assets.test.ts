import { describe, expect, it } from "vitest";

import { CATEGORIES, type CategorySlug } from "@/lib/catalogue/categories";
import {
  isProductRangeImage,
  matchesCategory,
  PRODUCT_RANGE_ASSET_ROOT,
  productRangeImageUrl,
  rangeNameTokens,
  readProductRangeImages,
} from "@/lib/media/product-range-assets";

describe("product range image formats", () => {
  it("accepts the web image formats the folder ships", () => {
    for (const filename of [
      "motorcycle.webp",
      "moto.jpg",
      "truck.jpeg",
      "otr.png",
      "agriculture.avif",
      "MOTO.PNG",
    ]) {
      expect(isProductRangeImage(filename)).toBe(true);
    }
  });

  it("ignores unsupported or extensionless files", () => {
    for (const filename of ["notes.pdf", "clip.mp4", "README", ".gitkeep"]) {
      expect(isProductRangeImage(filename)).toBe(false);
    }
  });
});

describe("range name tokens", () => {
  it("lower-cases, drops extensions and splits on punctuation", () => {
    expect(rangeNameTokens("Moto.PNG")).toEqual(["moto"]);
    expect(rangeNameTokens("Truck & Bus Tyres.jpg")).toEqual([
      "truck",
      "bus",
      "tyres",
    ]);
    expect(rangeNameTokens("three_wheeler.webp")).toEqual([
      "three",
      "wheeler",
    ]);
  });
});

describe("product range image URLs", () => {
  it("serves flat from the products folder (no subfolders)", () => {
    expect(PRODUCT_RANGE_ASSET_ROOT).toBe("/assets/products");
    expect(productRangeImageUrl("moto.png")).toBe("/assets/products/moto.png");
    expect(productRangeImageUrl("tuktuk.png")).toBe(
      "/assets/products/tuktuk.png",
    );
  });

  it("percent-encodes spaces and symbols in filenames", () => {
    expect(productRangeImageUrl("Truck & Bus.jpg")).toBe(
      "/assets/products/Truck%20%26%20Bus.jpg",
    );
  });
});

describe("filename → range matching", () => {
  const cases: Array<[string, CategorySlug]> = [
    ["agriculture.png", "agriculture"],
    ["forklift.png", "forklift"],
    ["moto.png", "motorcycle"],
    ["otr.png", "otr"],
    ["truck.png", "truck-bus"],
    ["tube.png", "tubes"],
    ["tuktuk.png", "three-wheeler"],
    ["motorcycle.webp", "motorcycle"],
    ["truck-bus.png", "truck-bus"],
    ["Truck & Bus Tyres.jpg", "truck-bus"],
    ["three-wheeler-01.png", "three-wheeler"],
    ["01-forklift.png", "forklift"],
  ];

  for (const [file, slug] of cases) {
    it(`"${file}" → ${slug}`, () => {
      expect(matchesCategory(file, slug)).toBe(true);
    });
  }

  it("does not match a different range", () => {
    expect(matchesCategory("motorcycle.png", "truck-bus")).toBe(false);
    expect(matchesCategory("truck.png", "motorcycle")).toBe(false);
    expect(matchesCategory("otr.png", "motorcycle")).toBe(false);
    expect(matchesCategory("moto.png", "tubes")).toBe(false);
  });
});

describe("shipped thumbnails", () => {
  it("resolves a supplied thumbnail for every canonical range", () => {
    const images = readProductRangeImages();
    const slugs = CATEGORIES.map((category) => category.slug);

    expect(Object.keys(images).sort()).toEqual([...slugs].sort());

    for (const slug of slugs) {
      const url = images[slug];
      expect(url).not.toBeNull();
      expect(url?.startsWith(`${PRODUCT_RANGE_ASSET_ROOT}/`)).toBe(true);

      const filename = decodeURIComponent(
        (url as string).slice(PRODUCT_RANGE_ASSET_ROOT.length + 1),
      );
      expect(filename).not.toContain("/");
      expect(isProductRangeImage(filename)).toBe(true);
    }
  });
});

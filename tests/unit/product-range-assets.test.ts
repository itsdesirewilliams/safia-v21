import { describe, expect, it } from "vitest";

import { CATEGORIES } from "@/lib/catalogue/categories";
import {
  isProductRangeImage,
  PRODUCT_RANGE_ASSET_ROOT,
  productRangeImageUrl,
  readProductRangeImages,
} from "@/lib/media/product-range-assets";

describe("product range image formats", () => {
  it("accepts the web image formats the range folders ship", () => {
    for (const filename of [
      "a.webp",
      "a.jpg",
      "a.jpeg",
      "a.png",
      "a.avif",
      "A.JPG",
    ]) {
      expect(isProductRangeImage(filename)).toBe(true);
    }
  });

  it("ignores unsupported or extensionless files", () => {
    for (const filename of [
      "a.svg",
      "a.gif",
      "a.mp4",
      "a.pdf",
      "README",
      ".gitkeep",
    ]) {
      expect(isProductRangeImage(filename)).toBe(false);
    }
  });
});

describe("product range image URLs", () => {
  it("serves each image from its category folder", () => {
    expect(PRODUCT_RANGE_ASSET_ROOT).toBe("/assets/products");
    expect(productRangeImageUrl("motorcycle", "range.jpg")).toBe(
      "/assets/products/motorcycle/range.jpg",
    );
  });

  it("percent-encodes spaces and symbols in filenames", () => {
    expect(productRangeImageUrl("truck-bus", "Truck & Bus.jpg")).toBe(
      "/assets/products/truck-bus/Truck%20%26%20Bus.jpg",
    );
  });
});

describe("product range image discovery", () => {
  it("keys an entry for every canonical range", () => {
    const images = readProductRangeImages();
    const slugs = CATEGORIES.map((category) => category.slug).sort();

    expect(Object.keys(images).sort()).toEqual(slugs);

    for (const slug of slugs) {
      const image = images[slug];
      expect(
        image === null || image.startsWith(`${PRODUCT_RANGE_ASSET_ROOT}/${slug}/`),
      ).toBe(true);
    }
  });
});

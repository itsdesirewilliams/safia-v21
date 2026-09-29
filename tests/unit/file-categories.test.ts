import { describe, expect, it } from "vitest";

import {
  FILE_CATEGORIES,
  REPOSITORY_CATEGORY_ID,
  findFileCategory,
  isFileCategoryId,
} from "@/lib/media/categories";

describe("file manager categories", () => {
  it("lists the required admin-managed categories", () => {
    expect(FILE_CATEGORIES.map((category) => category.id)).toEqual([
      "all",
      "gallery",
      "product-images",
      "blog-images",
      "quality-first",
    ]);
  });

  it("maps each category onto the shared Media buckets", () => {
    expect(findFileCategory("gallery").buckets).toEqual(["gallery"]);
    expect(findFileCategory("product-images").buckets).toEqual([
      "product-images",
    ]);
    expect(findFileCategory("blog-images").buckets).toEqual(["blog-images"]);
    expect(findFileCategory("quality-first").buckets).toEqual([
      "testing-videos",
      "machine-images",
    ]);
    expect(findFileCategory("all").buckets).toBeNull();
  });

  it("defaults unknown ids to All Files", () => {
    expect(findFileCategory("does-not-exist").id).toBe("all");
    expect(isFileCategoryId("gallery")).toBe(true);
    expect(isFileCategoryId(REPOSITORY_CATEGORY_ID)).toBe(false);
  });
});

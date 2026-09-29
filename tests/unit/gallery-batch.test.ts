import { describe, expect, it } from "vitest";

import {
  GALLERY_BATCH_MAX,
  GALLERY_IMAGE_ACCEPT,
  isSafeGalleryPath,
} from "@/lib/media/gallery-batch";

describe("gallery batch", () => {
  it("accepts canonical year-month object keys", () => {
    expect(
      isSafeGalleryPath(
        "2026-09/123e4567-e89b-12d3-a456-426614174000-photo.jpg",
      ),
    ).toBe(true);
  });

  it("rejects traversal, stray folders and malformed keys", () => {
    for (const bad of [
      "../photo.jpg",
      "2026-09/../x.jpg",
      "photo.jpg",
      "2026-09/a/b.jpg",
      "2026-9/x.jpg",
      "2026-09/x.jpg/",
      "",
    ]) {
      expect(isSafeGalleryPath(bad)).toBe(false);
    }
  });

  it("exposes an image-only accept hint and a sane batch cap", () => {
    expect(GALLERY_IMAGE_ACCEPT).not.toContain("video");
    expect(GALLERY_IMAGE_ACCEPT).toContain("image/jpeg");
    expect(GALLERY_BATCH_MAX).toBeGreaterThan(1);
  });
});

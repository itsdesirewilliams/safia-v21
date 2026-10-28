import { describe, expect, it } from "vitest";

import {
  BLOG_IMAGE_MIME_TYPES,
  isSafeBlogMediaPath,
} from "@/lib/blog/upload-path";

describe("blog media upload path", () => {
  it("accepts paths under the blog namespace", () => {
    expect(
      isSafeBlogMediaPath("blog/2026-03/8b1c0f1e-2f5a-4a5a-9d6b-1a2b3c4d5e6f-tyre.webp"),
    ).toBe(true);
    expect(
      isSafeBlogMediaPath("blog/2026-03/8b1c0f1e-2f5a-4a5a-9d6b-1a2b3c4d5e6f-photo.jpg"),
    ).toBe(true);
  });

  it("rejects traversal, other buckets and malformed paths", () => {
    expect(isSafeBlogMediaPath("../blog/2026-03/file.webp")).toBe(false);
    expect(isSafeBlogMediaPath("/blog/2026-03/file.webp")).toBe(false);
    expect(isSafeBlogMediaPath("gallery/2026-03/file.webp")).toBe(false);
    expect(isSafeBlogMediaPath("blog/2026-03/file")).toBe(false);
    expect(isSafeBlogMediaPath("blog/2026-03/File.WebP")).toBe(false);
    expect(isSafeBlogMediaPath("blog/2026-03/a b.webp")).toBe(false);
  });
});

describe("blog image MIME allow-list", () => {
  it("accepts JPG, PNG, WebP and AVIF only", () => {
    expect([...BLOG_IMAGE_MIME_TYPES]).toEqual([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ]);
    expect(BLOG_IMAGE_MIME_TYPES).not.toContain("image/gif");
  });
});

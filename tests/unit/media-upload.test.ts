import { describe, expect, it } from "vitest";

import {
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  buildStoragePath,
  detectMediaType,
  sanitizeFileName,
  validateUpload,
} from "@/lib/media/upload";
import { isMediaType } from "@/lib/media/types";
import {
  ADMIN_ONLY_BUCKET_IDS,
  bucketAcceptsType,
  GALLERY_BUCKET_IDS,
  isAdminOnlyBucket,
  isGalleryBucket,
  isQualityFirstBucket,
  isStorageBucketId,
  QUALITY_FIRST_BUCKET_IDS,
} from "@/lib/supabase/buckets";

const CREATED_AT = new Date("2026-09-23T12:00:00.000Z");
const ID = "11111111-2222-3333-4444-555555555555";

describe("storage bucket vocabulary", () => {
  it("recognises only the six provisioned buckets", () => {
    expect(isStorageBucketId("gallery")).toBe(true);
    expect(isStorageBucketId("testing-videos")).toBe(true);
    expect(isStorageBucketId("random-bucket")).toBe(false);
    expect(isStorageBucketId(null)).toBe(false);
  });

  it("keeps each bucket to its intended media types", () => {
    expect(bucketAcceptsType("catalogue-pdfs", "document")).toBe(true);
    expect(bucketAcceptsType("catalogue-pdfs", "image")).toBe(false);
    expect(bucketAcceptsType("testing-videos", "video")).toBe(true);
    expect(bucketAcceptsType("testing-videos", "image")).toBe(false);
    expect(bucketAcceptsType("gallery", "image")).toBe(true);
    expect(bucketAcceptsType("machine-images", "image")).toBe(true);
    expect(bucketAcceptsType("product-images", "video")).toBe(false);
  });

  it("marks the Quality First buckets for admin-only management", () => {
    expect(QUALITY_FIRST_BUCKET_IDS).toEqual([
      "testing-videos",
      "machine-images",
    ]);
    expect(isQualityFirstBucket("testing-videos")).toBe(true);
    expect(isQualityFirstBucket("machine-images")).toBe(true);
    expect(isQualityFirstBucket("gallery")).toBe(false);
  });

  it("treats the gallery bucket as restricted to admins, with Quality First", () => {
    expect(GALLERY_BUCKET_IDS).toEqual(["gallery"]);
    expect(isGalleryBucket("gallery")).toBe(true);
    expect(isGalleryBucket("blog-images")).toBe(false);

    expect(ADMIN_ONLY_BUCKET_IDS).toEqual([
      "testing-videos",
      "machine-images",
      "gallery",
    ]);
    expect(isAdminOnlyBucket("gallery")).toBe(true);
    expect(isAdminOnlyBucket("testing-videos")).toBe(true);
    expect(isAdminOnlyBucket("machine-images")).toBe(true);
    expect(isAdminOnlyBucket("blog-images")).toBe(false);
    expect(isAdminOnlyBucket("product-images")).toBe(false);
  });
});

describe("media type detection", () => {
  it("maps supported MIME types to the three media types", () => {
    expect(detectMediaType("image/png")).toBe("image");
    expect(detectMediaType("image/jpeg")).toBe("image");
    expect(detectMediaType("video/mp4")).toBe("video");
    expect(detectMediaType("application/pdf")).toBe("document");
  });

  it("returns null for unsupported MIME types", () => {
    expect(detectMediaType("application/zip")).toBeNull();
    expect(detectMediaType("application/x-msdownload")).toBeNull();
    expect(detectMediaType("text/html")).toBeNull();
  });

  it("recognises only the declared media types", () => {
    expect(isMediaType("image")).toBe(true);
    expect(isMediaType("video")).toBe(true);
    expect(isMediaType("document")).toBe(true);
    expect(isMediaType("audio")).toBe(false);
    expect(isMediaType(null)).toBe(false);
  });
});

describe("validateUpload", () => {
  it("accepts a supported image within the size limit", () => {
    const result = validateUpload({
      fileName: "Bias Tractor Tyre.PNG",
      mimeType: "image/png",
      sizeBytes: 1024,
    });

    expect(result).toEqual({
      ok: true,
      type: "image",
      extension: "png",
      safeName: "bias-tractor-tyre.png",
    });
  });

  it("derives the extension when the filename has none", () => {
    const result = validateUpload({
      fileName: "tyre",
      mimeType: "video/mp4",
      sizeBytes: 2048,
    });

    expect(result).toEqual({
      ok: true,
      type: "video",
      extension: "mp4",
      safeName: "tyre.mp4",
    });
  });

  it("rejects an unsupported content type", () => {
    const result = validateUpload({
      fileName: "installer.exe",
      mimeType: "application/x-msdownload",
      sizeBytes: 10,
    });

    expect(result.ok).toBe(false);
  });

  it("rejects a file whose extension contradicts its content type", () => {
    const result = validateUpload({
      fileName: "photo.exe",
      mimeType: "image/png",
      sizeBytes: 10,
    });

    expect(result.ok).toBe(false);
  });

  it("rejects a file that exceeds the per-type size limit", () => {
    const result = validateUpload({
      fileName: "huge.png",
      mimeType: "image/png",
      sizeBytes: MAX_UPLOAD_BYTES.image + 1,
    });

    expect(result.ok).toBe(false);
  });

  it("accepts a video up to the video size limit", () => {
    const result = validateUpload({
      fileName: "tour.mp4",
      mimeType: "video/mp4",
      sizeBytes: MAX_UPLOAD_BYTES.video,
    });

    expect(result.ok).toBe(true);
  });

  it("rejects an empty file", () => {
    const result = validateUpload({
      fileName: "empty.png",
      mimeType: "image/png",
      sizeBytes: 0,
    });

    expect(result.ok).toBe(false);
  });

  it("rejects filenames that attempt path traversal", () => {
    for (const fileName of [
      "../../etc/passwd.png",
      "..\\windows\\system32\\x.png",
      "nested/dir/photo.png",
    ]) {
      const result = validateUpload({
        fileName,
        mimeType: "image/png",
        sizeBytes: 10,
      });
      expect(result.ok).toBe(false);
    }
  });

  it("publishes the per-type size limits and allowed MIME types", () => {
    expect(MAX_UPLOAD_BYTES.image).toBeGreaterThan(0);
    expect(ALLOWED_MIME_TYPES.image).toContain("image/png");
    expect(ALLOWED_MIME_TYPES.video).toContain("video/mp4");
    expect(ALLOWED_MIME_TYPES.document).toEqual(["application/pdf"]);
  });
});

describe("sanitizeFileName", () => {
  it("slugifies a display filename without touching its extension", () => {
    expect(sanitizeFileName("Bias Tractor Tyre (R-1).PNG")).toBe(
      "bias-tractor-tyre-r-1.png",
    );
  });

  it("never returns path separators or traversal segments", () => {
    const safe = sanitizeFileName("../../etc/My File!.png");
    expect(safe).not.toContain("/");
    expect(safe).not.toContain("\\");
    expect(safe).not.toContain("..");
    expect(safe.endsWith(".png")).toBe(true);
  });
});

describe("buildStoragePath", () => {
  it("groups objects by year-month with a unique prefix", () => {
    expect(
      buildStoragePath({
        safeName: "tyre.png",
        id: ID,
        createdAt: CREATED_AT,
      }),
    ).toBe(`2026-09/${ID}-tyre.png`);
  });

  it("adds a sanitised scope folder when one is supplied", () => {
    expect(
      buildStoragePath({
        safeName: "tyre.png",
        id: ID,
        createdAt: CREATED_AT,
        scope: "TR-1042",
      }),
    ).toBe(`tr-1042/2026-09/${ID}-tyre.png`);
  });

  it("ignores an empty or unsafe scope", () => {
    expect(
      buildStoragePath({
        safeName: "tyre.png",
        id: ID,
        createdAt: CREATED_AT,
        scope: "  ",
      }),
    ).toBe(`2026-09/${ID}-tyre.png`);
    expect(
      buildStoragePath({
        safeName: "tyre.png",
        id: ID,
        createdAt: CREATED_AT,
        scope: "../..",
      }),
    ).toBe(`2026-09/${ID}-tyre.png`);
  });

  it("never yields a leading slash or traversal segment", () => {
    const path = buildStoragePath({
      safeName: "tyre.png",
      id: ID,
      createdAt: CREATED_AT,
      scope: "truck-bus",
    });
    expect(path.startsWith("/")).toBe(false);
    expect(path.includes("..")).toBe(false);
  });
});

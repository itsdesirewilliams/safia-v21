import { describe, expect, it } from "vitest";

import { mapMediaRow, sanitizeSearchTerm } from "@/lib/media/record";

const BASE = "https://example.supabase.co";

const ROW = {
  id: "media-1",
  bucket: "gallery",
  storage_path: "2026-09/abc-tyre.png",
  type: "image",
  mime_type: "image/png",
  alt: "A truck tyre",
  caption: "Truck tyre",
  pattern_code: null,
  category_slug: "truck-bus",
  uploaded_by: "user-1",
  created_at: "2026-09-23T12:00:00.000Z",
  hidden: false,
};

describe("mapMediaRow", () => {
  it("resolves a valid row into a Media asset", () => {
    expect(mapMediaRow(ROW, BASE)).toEqual({
      id: "media-1",
      bucket: "gallery",
      path: "2026-09/abc-tyre.png",
      url: `${BASE}/storage/v1/object/public/gallery/2026-09/abc-tyre.png`,
      type: "image",
      mimeType: "image/png",
      alt: "A truck tyre",
      caption: "Truck tyre",
      patternCode: null,
      categorySlug: "truck-bus",
      uploadedBy: "user-1",
      createdAt: "2026-09-23T12:00:00.000Z",
      hidden: false,
    });
  });

  it("returns null for an unknown bucket", () => {
    expect(mapMediaRow({ ...ROW, bucket: "secrets" }, BASE)).toBeNull();
  });

  it("returns null for an unknown media type", () => {
    expect(mapMediaRow({ ...ROW, type: "audio" }, BASE)).toBeNull();
  });

  it("treats a missing hidden flag as visible", () => {
    const legacyRow = { ...ROW, hidden: undefined };
    expect(mapMediaRow(legacyRow, BASE)?.hidden).toBe(false);
  });
});

describe("sanitizeSearchTerm", () => {
  it("joins words with the ILIKE wildcard", () => {
    expect(sanitizeSearchTerm("  Bias Tractor  ")).toBe("Bias%Tractor");
  });

  it("keeps pattern codes and dashes intact", () => {
    expect(sanitizeSearchTerm("TR-1042")).toBe("TR-1042");
  });

  it("strips characters that would break the PostgREST filter", () => {
    expect(sanitizeSearchTerm("a,b(c)*d_%")).toBe("abcd");
  });

  it("returns an empty string when nothing usable remains", () => {
    expect(sanitizeSearchTerm("(),")).toBe("");
  });
});

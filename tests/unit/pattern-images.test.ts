import { describe, expect, it } from "vitest";

import { mapPatternImageUrls } from "@/lib/media/pattern-images";

const BASE = "https://example.supabase.co";

describe("pattern image mapping", () => {
  it("associates a pattern code to its public image URL", () => {
    const urls = mapPatternImageUrls(
      [{ pattern_code: "SFM-101", storage_path: "patterns/sfm-101/a.jpg" }],
      BASE,
    );

    expect(urls.get("SFM-101")).toBe(
      `${BASE}/storage/v1/object/public/product-images/patterns/sfm-101/a.jpg`,
    );
  });

  it("normalizes the stored code for case-insensitive lookup", () => {
    const urls = mapPatternImageUrls(
      [{ pattern_code: " tw-17 ", storage_path: "patterns/tw-17/a.png" }],
      BASE,
    );

    expect(urls.get("TW-17")).toBeTruthy();
  });

  it("ignores records without a pattern code", () => {
    const urls = mapPatternImageUrls(
      [{ pattern_code: null, storage_path: "patterns/x/a.jpg" }],
      BASE,
    );
    expect(urls.size).toBe(0);
  });

  it("keeps the first (newest) record when a code repeats", () => {
    const urls = mapPatternImageUrls(
      [
        { pattern_code: "TR-1019", storage_path: "patterns/tr-1019/new.jpg" },
        { pattern_code: "TR-1019", storage_path: "patterns/tr-1019/old.jpg" },
      ],
      BASE,
    );

    expect(urls.get("TR-1019")).toContain("new.jpg");
  });
});

import { describe, expect, it } from "vitest";

import { resolveMediaPublicUrl } from "@/lib/media/url";

const BASE = "https://example.supabase.co";

describe("resolveMediaPublicUrl", () => {
  it("builds the Supabase Storage public URL for a bucket object", () => {
    expect(
      resolveMediaPublicUrl(
        BASE,
        "gallery",
        "2026-09/abc-safeway-tyre.png",
      ),
    ).toBe(
      `${BASE}/storage/v1/object/public/gallery/2026-09/abc-safeway-tyre.png`,
    );
  });

  it("tolerates a trailing slash on the project URL", () => {
    expect(
      resolveMediaPublicUrl(`${BASE}/`, "gallery", "a.png"),
    ).toBe(`${BASE}/storage/v1/object/public/gallery/a.png`);
  });

  it("tolerates a leading slash on the object path", () => {
    expect(
      resolveMediaPublicUrl(BASE, "gallery", "/a.png"),
    ).toBe(`${BASE}/storage/v1/object/public/gallery/a.png`);
  });

  it("percent-encodes each path segment", () => {
    expect(
      resolveMediaPublicUrl(BASE, "product-images", "tr-1042/my tyre.png"),
    ).toBe(
      `${BASE}/storage/v1/object/public/product-images/tr-1042/my%20tyre.png`,
    );
  });

  it("rejects traversal segments", () => {
    expect(() => resolveMediaPublicUrl(BASE, "gallery", "../secret.png")).toThrow();
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { wrapIndex } from "@/lib/gallery";
import type { GalleryImage } from "@/lib/media/gallery";

const IMAGES: GalleryImage[] = [
  {
    path: "2026-09/b.png",
    url: "https://example.supabase.co/storage/v1/object/public/gallery/2026-09/b.png",
    caption: "Newest shot",
    alt: "A tyre line",
    createdAt: "2026-09-20T00:00:00.000Z",
  },
  {
    path: "2026-09/a.png",
    url: "https://example.supabase.co/storage/v1/object/public/gallery/2026-09/a.png",
    caption: "Safeway Tyre",
    alt: "Safeway Tyre",
    createdAt: "2026-09-10T00:00:00.000Z",
  },
];

describe("viewer index navigation", () => {
  it("wraps forward and backward across the sequence", () => {
    expect(wrapIndex(0, 3)).toBe(0);
    expect(wrapIndex(1, 3)).toBe(1);
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(4, 3)).toBe(1);
  });

  it("is safe with an empty sequence", () => {
    expect(wrapIndex(0, 0)).toBe(0);
    expect(wrapIndex(-2, 0)).toBe(0);
  });
});

describe("gallery grid", () => {
  it("shows a labelled placeholder when no images are supplied", () => {
    const html = renderToStaticMarkup(<GalleryGrid images={[]} />);

    expect(html).toContain("Gallery Coming Soon");
  });

  it("renders a Masonry layout with a sizer and natural-ratio items", () => {
    const html = renderToStaticMarkup(<GalleryGrid images={IMAGES} />);

    expect(html).toContain("data-gallery-sizer");
    expect(html.match(/data-gallery-item/g)).toHaveLength(2);
    expect(html).toContain("w-1/2");
    expect(html).toContain("sm:w-1/3");
    expect(html).toContain("lg:w-1/4");
    // Natural aspect ratio: full width, auto height — never cropped or squared.
    expect(html).toContain("h-auto w-full");
    expect(html).not.toContain("object-cover");
    expect(html).not.toContain("aspect-square");
    expect(html).not.toContain("grid-cols-2");
  });

  it("renders one openable tile per image with its alt and caption", () => {
    const html = renderToStaticMarkup(<GalleryGrid images={IMAGES} />);

    expect(html.match(/<img /g)).toHaveLength(2);
    expect(html).toContain("A tyre line");
    expect(html).toContain('aria-label="Open image 1 of 2: Newest shot"');
    expect(html).toContain('aria-label="Open image 2 of 2: Safeway Tyre"');
    expect(html).not.toContain('role="dialog"');
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assetUrl,
  buildSliderSlides,
  pairSliderAssets,
  ratioForViewport,
  resolveSlideSource,
  resolveSliderConfig,
  SLIDER_BREAKPOINT_PX,
  SLIDER_COLLECTIONS,
  SLIDER_PORTRAIT_MEDIA,
  type SliderSlide,
} from "@/lib/media/slider";
import { naturalCompare } from "@/lib/natural-order";
import { readSliderSlides } from "@/lib/media/slider-assets";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("art-direction breakpoint", () => {
  it("selects portrait below 768px and landscape at 768px and above", () => {
    expect(SLIDER_BREAKPOINT_PX).toBe(768);
    expect(ratioForViewport(320)).toBe("portrait");
    expect(ratioForViewport(767)).toBe("portrait");
    expect(ratioForViewport(768)).toBe("landscape");
    expect(ratioForViewport(1440)).toBe("landscape");
  });

  it("expresses the portrait selection as a max-width media query", () => {
    expect(SLIDER_PORTRAIT_MEDIA).toBe("(max-width: 767px)");
  });

  it("resolves the viewport's ratio for a fully paired slide", () => {
    const slide: SliderSlide = {
      filename: "slide-1.svg",
      landscape: "/assets/landscape/catalogue/slide-1.svg",
      portrait: "/assets/portrait/catalogue/slide-1.svg",
    };

    expect(resolveSlideSource(slide, 480)).toBe(slide.portrait);
    expect(resolveSlideSource(slide, 1024)).toBe(slide.landscape);
  });
});

describe("missing-ratio fallback", () => {
  it("uses the available asset when portrait is missing", () => {
    const slide: SliderSlide = {
      filename: "slide-1.svg",
      landscape: "/assets/landscape/catalogue/slide-1.svg",
      portrait: null,
    };

    expect(resolveSlideSource(slide, 480)).toBe(slide.landscape);
    expect(resolveSlideSource(slide, 1024)).toBe(slide.landscape);
  });

  it("uses the available asset when landscape is missing", () => {
    const slide: SliderSlide = {
      filename: "slide-1.svg",
      landscape: null,
      portrait: "/assets/portrait/catalogue/slide-1.svg",
    };

    expect(resolveSlideSource(slide, 480)).toBe(slide.portrait);
    expect(resolveSlideSource(slide, 1024)).toBe(slide.portrait);
  });

  it("never drops a slide that has only one ratio", () => {
    const slides = buildSliderSlides(
      "catalogue",
      ["slide-1.svg", "slide-2.svg"],
      ["slide-1.svg"],
    );

    expect(slides.map((slide) => slide.filename)).toEqual([
      "slide-1.svg",
      "slide-2.svg",
    ]);
    expect(slides[1]).toEqual({
      filename: "slide-2.svg",
      landscape: "/assets/landscape/catalogue/slide-2.svg",
      portrait: null,
    });
  });
});

describe("filename pairing", () => {
  it("pairs slides by matching filename across the two folders", () => {
    const pairs = pairSliderAssets(
      ["b.svg", "a.svg"],
      ["a.svg", "b.svg"],
    );

    expect(pairs).toEqual([
      { filename: "a.svg", landscape: true, portrait: true },
      { filename: "b.svg", landscape: true, portrait: true },
    ]);
  });

  it("takes the union of both folders", () => {
    const pairs = pairSliderAssets(["a.svg"], ["c.svg", "b.svg"]);

    expect(pairs).toEqual([
      { filename: "a.svg", landscape: true, portrait: false },
      { filename: "b.svg", landscape: false, portrait: true },
      { filename: "c.svg", landscape: false, portrait: true },
    ]);
  });
});

describe("natural filename ordering", () => {
  it("orders numeric runs by value, not lexically", () => {
    expect(["slide-10.svg", "slide-2.svg", "slide-1.svg"].sort(naturalCompare))
      .toEqual(["slide-1.svg", "slide-2.svg", "slide-10.svg"]);
    expect(naturalCompare("slide-2.svg", "slide-10.svg")).toBeLessThan(0);
  });

  it("applies the same ordering when pairing", () => {
    const pairs = pairSliderAssets(
      ["slide-10.svg", "slide-2.svg"],
      ["slide-10.svg", "slide-2.svg"],
    );

    expect(pairs.map((pair) => pair.filename)).toEqual([
      "slide-2.svg",
      "slide-10.svg",
    ]);
  });
});

describe("component configuration", () => {
  it("serves both collections from their own asset folders", () => {
    expect(SLIDER_COLLECTIONS).toEqual(["catalogue", "business-profile"]);
    expect(assetUrl("catalogue", "landscape", "x.svg")).toBe(
      "/assets/landscape/catalogue/x.svg",
    );
    expect(assetUrl("business-profile", "portrait", "x.svg")).toBe(
      "/assets/portrait/business-profile/x.svg",
    );
  });

  it("labels each collection and only links a catalogue download", () => {
    vi.stubEnv("NEXT_PUBLIC_CATALOGUE_DOWNLOAD_URL", "");

    expect(resolveSliderConfig("catalogue")).toEqual({
      collection: "catalogue",
      label: "Catalogue",
      downloadUrl: null,
    });
    expect(resolveSliderConfig("business-profile")).toEqual({
      collection: "business-profile",
      label: "Business Profile",
      downloadUrl: null,
    });
  });

  it("reads the catalogue download URL from configuration", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_CATALOGUE_DOWNLOAD_URL",
      "https://example.com/catalogue.pdf",
    );

    expect(resolveSliderConfig("catalogue").downloadUrl).toBe(
      "https://example.com/catalogue.pdf",
    );
    expect(resolveSliderConfig("business-profile").downloadUrl).toBeNull();
  });
});

describe("shipped developer assets", () => {
  it.each([...SLIDER_COLLECTIONS])(
    "%s ships paired landscape and portrait artwork",
    (collection) => {
      const slides = readSliderSlides(collection);

      expect(slides.length).toBeGreaterThan(0);

      for (const slide of slides) {
        expect(slide.landscape).toBe(
          assetUrl(collection, "landscape", slide.filename),
        );
        expect(slide.portrait).toBe(
          assetUrl(collection, "portrait", slide.filename),
        );
      }

      const filenames = slides.map((slide) => slide.filename);
      expect(filenames).toEqual([...filenames].sort(naturalCompare));
    },
  );
});

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assetUrl,
  buildPortraitOnlySlides,
  buildSliderSlides,
  isPortraitOnlyCollection,
  pairSliderAssets,
  ratioForViewport,
  resolveSlideSource,
  resolveSliderConfig,
  SLIDER_BREAKPOINT_PX,
  SLIDER_ASSET_ROOTS,
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
      landscape: "/assets/business-profile/landscape/slide-1.svg",
      portrait: "/assets/business-profile/portrait/slide-1.svg",
    };

    expect(resolveSlideSource(slide, 480)).toBe(slide.portrait);
    expect(resolveSlideSource(slide, 1024)).toBe(slide.landscape);
  });
});

describe("missing-ratio fallback", () => {
  it("uses the available asset when portrait is missing", () => {
    const slide: SliderSlide = {
      filename: "slide-1.svg",
      landscape: "/assets/business-profile/landscape/slide-1.svg",
      portrait: null,
    };

    expect(resolveSlideSource(slide, 480)).toBe(slide.landscape);
    expect(resolveSlideSource(slide, 1024)).toBe(slide.landscape);
  });

  it("uses the available asset when landscape is missing", () => {
    const slide: SliderSlide = {
      filename: "slide-1.svg",
      landscape: null,
      portrait: "/assets/business-profile/portrait/slide-1.svg",
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
      landscape: "/assets/catalogue/portrait/slide-2.svg",
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
      {
        filename: "a.svg",
        landscapeFilename: "a.svg",
        portraitFilename: "a.svg",
      },
      {
        filename: "b.svg",
        landscapeFilename: "b.svg",
        portraitFilename: "b.svg",
      },
    ]);
  });

  it("pairs exports that share a leading number even when named differently", () => {
    const pairs = pairSliderAssets(
      ["01 Cover.jpg", "02 Intro A.jpg"],
      ["Biz Profile 01.jpg", "Biz Profile 02.jpg"],
    );

    expect(pairs).toEqual([
      {
        filename: "01 Cover.jpg",
        landscapeFilename: "01 Cover.jpg",
        portraitFilename: "Biz Profile 01.jpg",
      },
      {
        filename: "02 Intro A.jpg",
        landscapeFilename: "02 Intro A.jpg",
        portraitFilename: "Biz Profile 02.jpg",
      },
    ]);
  });

  it("takes the union of both folders, leaving unmatched ratios null", () => {
    const pairs = pairSliderAssets(["a.svg"], ["c.svg", "b.svg"]);

    expect(pairs).toEqual([
      { filename: "a.svg", landscapeFilename: "a.svg", portraitFilename: null },
      { filename: "b.svg", landscapeFilename: null, portraitFilename: "b.svg" },
      { filename: "c.svg", landscapeFilename: null, portraitFilename: "c.svg" },
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
  it("serves each collection from its canonical asset folders", () => {
    expect(SLIDER_COLLECTIONS).toEqual(["catalogue", "business-profile"]);
    expect(assetUrl("catalogue", "portrait", "x.svg")).toBe(
      "/assets/catalogue/portrait/x.svg",
    );
    expect(assetUrl("business-profile", "landscape", "x.svg")).toBe(
      "/assets/business-profile/landscape/x.svg",
    );
    expect(assetUrl("business-profile", "portrait", "x.svg")).toBe(
      "/assets/business-profile/portrait/x.svg",
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

describe("portrait-only collections", () => {
  it("builds catalogue slides from portrait artwork only", () => {
    const slides = buildPortraitOnlySlides("catalogue", ["b.jpg", "a.jpg"]);

    expect(slides).toEqual([
      {
        filename: "a.jpg",
        landscape: null,
        portrait: "/assets/catalogue/portrait/a.jpg",
      },
      {
        filename: "b.jpg",
        landscape: null,
        portrait: "/assets/catalogue/portrait/b.jpg",
      },
    ]);
  });

  it("marks Catalogue portrait-only and Business Profile paired", () => {
    expect(isPortraitOnlyCollection("catalogue")).toBe(true);
    expect(isPortraitOnlyCollection("business-profile")).toBe(false);
  });
});

describe("shipped developer assets", () => {
  it.each([...SLIDER_COLLECTIONS])(
    "%s ships its supplied artwork",
    (collection) => {
      const slides = readSliderSlides(collection);

      expect(slides.length).toBeGreaterThan(0);

      for (const slide of slides) {
        if (isPortraitOnlyCollection(collection)) {
          expect(slide.landscape).toBeNull();
          expect(slide.portrait).toMatch(
            new RegExp(`^${SLIDER_ASSET_ROOTS[collection].portrait}/`),
          );
        } else {
          // Every supplied asset is represented; a slide shows at least one
          // ratio, and each non-null URL points into that ratio's folder.
          expect(slide.landscape ?? slide.portrait).not.toBeNull();
          if (slide.landscape) {
            expect(slide.landscape).toMatch(
              new RegExp(`^${SLIDER_ASSET_ROOTS[collection].landscape}/`),
            );
          }
          if (slide.portrait) {
            expect(slide.portrait).toMatch(
              new RegExp(`^${SLIDER_ASSET_ROOTS[collection].portrait}/`),
            );
          }
        }
      }

      const filenames = slides.map((slide) => slide.filename);
      expect(filenames).toEqual([...filenames].sort(naturalCompare));
    },
  );
});

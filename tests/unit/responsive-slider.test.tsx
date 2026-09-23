import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ResponsiveSliderView } from "@/components/media/responsive-slider-view";
import {
  SLIDER_PORTRAIT_MEDIA,
  type SliderConfig,
  type SliderSlide,
} from "@/lib/media/slider";

const CONFIG: SliderConfig = {
  collection: "catalogue",
  label: "Catalogue",
  downloadUrl: null,
};

function render(slides: SliderSlide[], config: SliderConfig = CONFIG) {
  return renderToStaticMarkup(
    <ResponsiveSliderView config={config} slides={slides} />,
  );
}

describe("responsive slider art direction", () => {
  it("renders a portrait <source> above a landscape <img> fallback", () => {
    const html = render([
      {
        filename: "slide-1.svg",
        landscape: "/assets/landscape/catalogue/slide-1.svg",
        portrait: "/assets/portrait/catalogue/slide-1.svg",
      },
    ]);

    expect(html).toContain("<picture>");
    expect(html).toContain(`media="${SLIDER_PORTRAIT_MEDIA}"`);
    expect(html).toMatch(
      /src[Ss]et="\/assets\/portrait\/catalogue\/slide-1\.svg"/,
    );
    expect(html).toContain('src="/assets/landscape/catalogue/slide-1.svg"');
  });

  it("falls back to landscape when no portrait asset exists", () => {
    const html = render([
      {
        filename: "slide-1.svg",
        landscape: "/assets/landscape/catalogue/slide-1.svg",
        portrait: null,
      },
    ]);

    expect(html).not.toContain("<source");
    expect(html).toContain('src="/assets/landscape/catalogue/slide-1.svg"');
  });

  it("falls back to portrait when no landscape asset exists", () => {
    const html = render([
      {
        filename: "slide-1.svg",
        landscape: null,
        portrait: "/assets/portrait/catalogue/slide-1.svg",
      },
    ]);

    expect(html).toContain("<source");
    expect(html).toMatch(
      /src[Ss]et="\/assets\/portrait\/catalogue\/slide-1\.svg"/,
    );
    expect(html).toContain('src="/assets/portrait/catalogue/slide-1.svg"');
  });

  it("never applies object-fit between the ratios", () => {
    const html = render([
      {
        filename: "slide-1.svg",
        landscape: "/assets/landscape/catalogue/slide-1.svg",
        portrait: "/assets/portrait/catalogue/slide-1.svg",
      },
    ]);

    expect(html).not.toContain("object-fit");
    expect(html).not.toContain("object-cover");
  });
});

describe("responsive slider controls", () => {
  const slides: SliderSlide[] = [
    {
      filename: "slide-1.svg",
      landscape: "/assets/landscape/catalogue/slide-1.svg",
      portrait: "/assets/portrait/catalogue/slide-1.svg",
    },
    {
      filename: "slide-2.svg",
      landscape: "/assets/landscape/catalogue/slide-2.svg",
      portrait: "/assets/portrait/catalogue/slide-2.svg",
    },
  ];

  it("renders prev/next controls and one indicator per slide", () => {
    const html = render(slides);

    expect(html).toContain('aria-label="Previous slide"');
    expect(html).toContain('aria-label="Next slide"');
    expect(html).toContain('aria-label="Go to slide 1"');
    expect(html).toContain('aria-label="Go to slide 2"');
    expect(html.match(/<img /g)).toHaveLength(slides.length);
  });

  it("hides controls for a single slide", () => {
    const html = render([slides[0]]);

    expect(html).not.toContain('aria-label="Previous slide"');
    expect(html).not.toContain("Go to slide 1");
  });

  it("shows a download action only when a URL is configured", () => {
    expect(render(slides)).not.toContain("Download Catalogue");

    const html = render(slides, {
      ...CONFIG,
      downloadUrl: "https://example.com/catalogue.pdf",
    });

    expect(html).toContain('href="https://example.com/catalogue.pdf"');
    expect(html).toContain("Download Catalogue");
  });
});

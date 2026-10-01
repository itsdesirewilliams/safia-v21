import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PatternCard } from "@/components/catalogue/pattern-card";
import { CATALOGUE, getPattern } from "@/lib/catalogue/dataset";

const AGRICULTURE = getPattern("agriculture", "bias-tractor-tyres-tr-1042");
const MOTORCYCLE = getPattern("motorcycle", "motorcycle-tyres-sfm-101");
const MANY_SIZES = CATALOGUE.patterns.find(
  (pattern) => pattern.patternCode === "TR-1055",
);

if (!AGRICULTURE || !MOTORCYCLE || !MANY_SIZES) {
  throw new Error("Expected catalogue fixtures to exist");
}

describe("Pattern card", () => {
  it("leads with the Pattern Code and keeps the functional name as the eyebrow", () => {
    const html = renderToStaticMarkup(<PatternCard pattern={AGRICULTURE} />);

    expect(html).toContain("TR-1042");
    expect(html).toContain("BIAS TRACTOR TYRES");
    // The heading is the code, never the category or a size.
    expect(html).toMatch(/<h3[^>]*>TR-1042<\/h3>/);
    expect(html).not.toMatch(/<h3[^>]*>Agriculture Tyres<\/h3>/);
  });

  it("falls back to the category name in the eyebrow when there is no functional name", () => {
    const html = renderToStaticMarkup(<PatternCard pattern={MOTORCYCLE} />);

    expect(html).toContain("Motorcycle Tyres");
    expect(html).toMatch(/<h3[^>]*>SFM-101<\/h3>/);
  });

  it("links to the Pattern detail route, identified by the Pattern slug", () => {
    const html = renderToStaticMarkup(<PatternCard pattern={AGRICULTURE} />);
    expect(html).toContain(
      'href="/products/agriculture/bias-tractor-tyres-tr-1042"',
    );
  });

  it("renders a neutral fallback when no image is associated", () => {
    const html = renderToStaticMarkup(<PatternCard pattern={AGRICULTURE} />);
    expect(html).toContain("Pattern image coming soon");
    expect(html).not.toContain("<img");
  });

  it("renders the associated Pattern image, preserving aspect ratio", () => {
    const html = renderToStaticMarkup(
      <PatternCard pattern={AGRICULTURE} imageUrl="https://cdn/x/tr-1042.jpg" />,
    );
    expect(html).toContain('src="https://cdn/x/tr-1042.jpg"');
    expect(html).toContain("object-contain");
  });

  it("bounds the size preview so the card height stays controlled", () => {
    const html = renderToStaticMarkup(<PatternCard pattern={MANY_SIZES} />);
    expect(html).toContain("line-clamp-2");
    expect(html).toMatch(/\+\d+ more/);
  });
});

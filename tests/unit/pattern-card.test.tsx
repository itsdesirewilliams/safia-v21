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
  it("leads with the Pattern Code as its only heading", () => {
    const html = renderToStaticMarkup(<PatternCard pattern={AGRICULTURE} />);

    expect(html).toMatch(/<h3[^>]*>TR-1042<\/h3>/);
  });

  it("renders no eyebrow, category or functional name", () => {
    const agriculture = renderToStaticMarkup(
      <PatternCard pattern={AGRICULTURE} />,
    );
    expect(agriculture).not.toContain("BIAS TRACTOR TYRES");
    expect(agriculture).not.toContain("Agriculture Tyres");
    // The old eyebrow class is gone.
    expect(agriculture).not.toContain("text-eyebrow");

    const motorcycle = renderToStaticMarkup(
      <PatternCard pattern={MOTORCYCLE} />,
    );
    expect(motorcycle).not.toContain("Motorcycle Tyres");
    expect(motorcycle).toMatch(/<h3[^>]*>SFM-101<\/h3>/);
  });

  it("places the sizes directly beneath the Pattern Code", () => {
    const html = renderToStaticMarkup(<PatternCard pattern={AGRICULTURE} />);
    const codeIndex = html.indexOf("TR-1042");
    const sizeIndex = html.indexOf("6.00-16");
    expect(codeIndex).toBeGreaterThan(-1);
    expect(sizeIndex).toBeGreaterThan(codeIndex);
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

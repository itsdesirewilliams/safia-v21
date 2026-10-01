import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { VariantTable } from "@/components/catalogue/variant-table";
import { getPattern } from "@/lib/catalogue/dataset";

const AGRICULTURE = getPattern("agriculture", "bias-tractor-tyres-tr-1042");

if (!AGRICULTURE) {
  throw new Error("Expected catalogue fixture to exist");
}

describe("Variant specification table", () => {
  it("shows the complete four-column specification", () => {
    const html = renderToStaticMarkup(
      <VariantTable variants={AGRICULTURE.variants} />,
    );

    for (const header of ["Size", "Ply rating", "TT/TL", "Application"]) {
      expect(html).toContain(header);
    }
    expect(html).toContain("6.00-16");
  });

  it("uses abbreviated headers and no horizontal scrolling on mobile", () => {
    const html = renderToStaticMarkup(
      <VariantTable variants={AGRICULTURE.variants} />,
    );

    // Compact short labels are always present for narrow screens.
    expect(html).toContain("Ply");
    expect(html).toContain("App.");
    // The fixed layout plus wrapping replaces the old horizontal scroller.
    expect(html).toContain("table-fixed");
    expect(html).not.toContain("overflow-x-auto");
  });
});

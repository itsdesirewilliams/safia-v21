// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { CatalogueSelectionBar } from "@/components/catalogue/catalogue-selection-bar";
import { VariantTable } from "@/components/catalogue/variant-table";
import { getPattern } from "@/lib/catalogue/dataset";

const AGRICULTURE = getPattern("agriculture", "bias-tractor-tyres-tr-1042");

if (!AGRICULTURE) {
  throw new Error("Expected catalogue fixture to exist");
}

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

describe("Shared catalogue size selection", () => {
  it("adds a tyre size to the shared quotation and prefills the enquiry form", async () => {
    const user = userEvent.setup();
    const size = AGRICULTURE.variants[0].public.size;
    render(
      <>
        <VariantTable
          variants={AGRICULTURE.variants}
          selection={{
            kind: "tyre",
            categoryKey: "agriculture",
            categoryLabel: "Agriculture Tyres",
            productCode: "TR-1042",
          }}
        />
        <CatalogueSelectionBar />
      </>,
    );

    await user.click(screen.getByRole("checkbox", { name: `Select ${size}` }));

    expect(
      screen.queryByRole("columnheader", { name: "Copy" }),
    ).toBeNull();
    const indicator = await screen.findByRole("button", {
      name: /Selected Products \(1\)/,
    });
    await user.click(indicator);

    const summary = screen.getByRole("dialog", {
      name: /Selected Products \(1\)/,
    });
    expect(within(summary).getByText(`TR-1042 — ${size}`)).toBeTruthy();
    expect(within(summary).getByText(/Agriculture Tyres/)).toBeTruthy();

    await user.click(
      within(summary).getByRole("button", { name: "Request quotation" }),
    );

    const quote = screen.getByRole("dialog", { name: "Request a quotation" });
    const message = within(quote).getByRole("textbox", { name: /Message/ });
    expect((message as HTMLTextAreaElement).value).toContain(
      `TR-1042 — ${size}`,
    );
    expect(
      (within(quote).getByRole("checkbox", { name: "Agriculture Tyres" }) as HTMLInputElement)
        .checked,
    ).toBe(true);
  });

  it("searches and filters the shared table", async () => {
    const user = userEvent.setup();
    const size = AGRICULTURE.variants[0].public.size;
    render(<VariantTable variants={AGRICULTURE.variants} />);

    const search = screen.getByRole("searchbox", { name: "Search sizes" });
    await user.type(search, size);

    expect(screen.getAllByText(size).length).toBeGreaterThan(0);
  });
});

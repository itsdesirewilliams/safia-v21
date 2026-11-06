// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CatalogueSelectionBar } from "@/components/catalogue/catalogue-selection-bar";
import { TubesCatalogue } from "@/components/tubes/tubes-catalogue";

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

function valveCard(code: string) {
  const card = screen.getByText(code).closest("a");
  expect(card).toBeTruthy();
  return card as HTMLAnchorElement;
}

describe("TubesCatalogue", () => {
  it("shows the application tabs and links valve cards to dedicated pages", async () => {
    const user = userEvent.setup();
    render(<TubesCatalogue />);

    expect(
      screen
        .getByRole("tab", { name: "Agriculture & OTR" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(valveCard("TR-13").getAttribute("href")).toBe("/products/tubes/tr-13");
    expect(screen.getByText("TR-218A")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(screen.getByRole("tab", { name: "Passenger Car" }));

    expect(screen.getByText("TR-13")).toBeTruthy();
    expect(screen.queryByText("TR-218A")).toBeNull();
  });

  it("searches globally and links a match to its dedicated valve page", async () => {
    const user = userEvent.setup();
    render(<TubesCatalogue />);

    const search = screen.getByRole("searchbox", {
      name: "Find a tube by size",
    });
    await user.type(search, "12.00 20");

    expect(screen.getByText(/Size matches for/)).toBeTruthy();
    expect(screen.getAllByText(/Valve TR-78A/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("12.00-20").length).toBeGreaterThan(0);
    expect(screen.getByText(/Bus \/ Light Truck & Truck/)).toBeTruthy();
    const open = screen
      .getAllByRole("link", { name: /Open TR-78A/ })
      .at(0);
    expect(open?.getAttribute("href")).toMatch(/^\/products\/tubes\//);
  });

  it("shows Flaps separately with all sizes and no Copy column", async () => {
    const user = userEvent.setup();
    render(<TubesCatalogue />);

    await user.click(screen.getByRole("tab", { name: "Flaps" }));

    expect(screen.getByRole("heading", { name: "Flaps" })).toBeTruthy();
    expect(screen.getByText("7.50-20")).toBeTruthy();
    expect(screen.getByText("18.00-25")).toBeTruthy();
    expect(screen.queryByText(/^Valve /)).toBeNull();
    expect(screen.queryByRole("columnheader", { name: "Copy" })).toBeNull();
    expect(
      screen.getByRole("searchbox", { name: "Search flap sizes" }),
    ).toBeTruthy();
  });

  it("filters the shared size table", async () => {
    const user = userEvent.setup();
    render(<TubesCatalogue />);
    await user.click(screen.getByRole("tab", { name: "Flaps" }));

    await user.type(
      screen.getByRole("searchbox", { name: "Search flap sizes" }),
      "7.50",
    );

    expect(screen.getByText("7.50-20")).toBeTruthy();
    expect(screen.queryByText("18.00-25")).toBeNull();
  });

  it("copies a size through the discreet accessible copy action", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    render(<TubesCatalogue />);
    await user.click(screen.getByRole("tab", { name: "Flaps" }));

    await user.click(screen.getByRole("button", { name: "Copy size 7.50-20" }));

    expect(writeText).toHaveBeenCalledWith("7.50-20");
  });

  it("collects sizes across the catalogue and prepares one quotation form", async () => {
    const user = userEvent.setup();
    render(
      <>
        <TubesCatalogue />
        <CatalogueSelectionBar />
      </>,
    );

    const search = screen.getByRole("searchbox", {
      name: "Find a tube by size",
    });
    await user.type(search, "4.00-8");
    await user.click(screen.getAllByRole("button", { name: "Add size" })[0]);
    await user.clear(search);

    await user.click(screen.getByRole("tab", { name: "Flaps" }));
    await user.click(screen.getByRole("checkbox", { name: "Select 7.50-20" }));

    const indicator = screen.getByRole("button", {
      name: /Selected Products \(2\)/,
    });
    await user.click(indicator);

    const summary = screen.getByRole("dialog", {
      name: /Selected Products \(2\)/,
    });
    expect(within(summary).getByText(/4\.00-8/)).toBeTruthy();
    expect(within(summary).getByText(/7\.50-20/)).toBeTruthy();

    await user.click(
      within(summary).getByRole("button", { name: "Request quotation" }),
    );

    const quote = screen.getByRole("dialog", { name: "Request a quotation" });
    const message = within(quote).getByRole("textbox", { name: /Message/ });
    expect((message as HTMLTextAreaElement).value).toContain("4.00-8");
    expect((message as HTMLTextAreaElement).value).toContain("7.50-20");
    expect(
      (within(quote).getByRole("checkbox", { name: "Tubes" }) as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(
      within(quote).getByRole("button", { name: "Send Inquiry" }),
    ).toBeTruthy();
  });
});

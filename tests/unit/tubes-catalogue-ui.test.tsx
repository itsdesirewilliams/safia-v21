// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TubesCatalogue } from "@/components/tubes/tubes-catalogue";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function openValveCard(code: string) {
  const codeNode = screen.getByText(code);
  const card = codeNode.closest("button");
  expect(card).toBeTruthy();
  return card as HTMLButtonElement;
}

describe("TubesCatalogue", () => {
  it("shows the application tabs and the valves for the selected application", async () => {
    const user = userEvent.setup();
    render(<TubesCatalogue />);

    expect(
      screen
        .getByRole("tab", { name: "Agriculture & OTR" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByText("TR-13")).toBeTruthy();
    expect(screen.getByText("TR-218A")).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: "Passenger Car" }));

    expect(screen.getByText("TR-13")).toBeTruthy();
    expect(screen.queryByText("TR-218A")).toBeNull();
  });

  it("opens a valve and lists its complete size variants", async () => {
    const user = userEvent.setup();
    render(<TubesCatalogue />);

    await user.click(openValveCard("TR-13"));

    const dialog = screen.getByRole("dialog", { name: /TR-13 — Available sizes/i });
    expect(dialog).toBeTruthy();
    expect(within(dialog).getByText("3.50-6")).toBeTruthy();
    expect(within(dialog).getByText("4.00-8")).toBeTruthy();
    expect(within(dialog).getByText("5.00-12")).toBeTruthy();
    expect(within(dialog).getByText(/91 verified sizes/)).toBeTruthy();
  });

  it("filters the drawer's size table", async () => {
    const user = userEvent.setup();
    render(<TubesCatalogue />);
    await user.click(openValveCard("TR-13"));

    const dialog = screen.getByRole("dialog", { name: /TR-13/ });
    await user.type(
      within(dialog).getByRole("searchbox", {
        name: "Search sizes for this valve",
      }),
      "4.00-8",
    );

    expect(within(dialog).getByText("4.00-8")).toBeTruthy();
    expect(within(dialog).queryByText("3.50-6")).toBeNull();
  });

  it("copies an individual size", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    render(<TubesCatalogue />);
    await user.click(openValveCard("TR-13"));

    await user.click(screen.getByRole("button", { name: "Copy 4.00-8" }));

    expect(writeText).toHaveBeenCalledWith("4.00-8");
    expect(screen.getByText("Copied")).toBeTruthy();
  });

  it("searches globally and normalizes formatting variations", async () => {
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
  });

  it("shows flaps separately without a valve column", async () => {
    const user = userEvent.setup();
    render(<TubesCatalogue />);

    await user.click(screen.getByRole("tab", { name: "Flaps" }));

    expect(screen.getByRole("heading", { name: "Flaps" })).toBeTruthy();
    expect(screen.getByText("7.50-20")).toBeTruthy();
    expect(screen.queryByText(/^Valve /)).toBeNull();
    expect(
      screen.getByRole("searchbox", { name: "Search flap sizes" }),
    ).toBeTruthy();
  });

  it("collects sizes across applications and prepares one quotation form", async () => {
    const user = userEvent.setup();
    render(<TubesCatalogue />);

    await user.click(openValveCard("TR-13"));
    await user.click(screen.getByRole("checkbox", { name: "Select 4.00-8" }));
    await user.click(screen.getByRole("button", { name: "Close" }));

    await user.click(screen.getByRole("tab", { name: "Flaps" }));
    await user.click(screen.getByRole("checkbox", { name: "Select 7.50-20" }));

    const indicator = screen.getByRole("button", {
      name: /Selected Products \(2\)/,
    });
    await user.click(indicator);

    const summary = screen.getByRole("dialog", {
      name: /Selected Products \(2\)/,
    });
    expect(within(summary).getByText("TR-13 — 4.00-8")).toBeTruthy();
    expect(within(summary).getByText("Flap — 7.50-20")).toBeTruthy();

    await user.click(
      within(summary).getByRole("button", { name: "Request quotation" }),
    );

    const quote = screen.getByRole("dialog", { name: "Request a quotation" });
    const message = within(quote).getByRole("textbox", { name: /Message/ });
    expect((message as HTMLTextAreaElement).value).toContain("TR-13 — 4.00-8");
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

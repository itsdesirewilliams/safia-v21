// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: () => null,
}));

// jsdom does not implement ResizeObserver or matchMedia, which the header
// uses to measure the navigation.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverStub);
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: true,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
}));

import { SiteHeader } from "@/components/site-header";
import { PRODUCT_MENU_ORDER } from "@/lib/catalogue/categories";
import { en } from "@/lib/i18n/dictionaries/en";

afterEach(cleanup);

function renderHeader() {
  return render(<SiteHeader locale="en" dict={en} />);
}

function productsButton() {
  return screen.getByRole("button", { name: /^Products/ });
}

describe("desktop Products menu", () => {
  it("opens the dropdown with exactly the seven ranges in menu order", () => {
    renderHeader();
    fireEvent.click(productsButton());

    const hrefs = PRODUCT_MENU_ORDER.map((slug) => `/products/${slug}`);
    for (const href of hrefs) {
      expect(
        screen.getAllByRole("link").some((link) => link.getAttribute("href") === href),
      ).toBe(true);
    }

    // No extra /products/ category links beyond the seven ranges and the three
    // radial submenu links (Nylon reuses the Truck & Bus route).
    const productLinks = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"))
      .filter((href): href is string => Boolean(href?.startsWith("/products/")));
    expect(new Set(productLinks).size).toBe(9);
  });

  it("keeps the Truck & Bus submenu closed until hovered or focused", () => {
    renderHeader();
    fireEvent.click(productsButton());

    const submenu = screen.getByTestId("submenu-Truck & Bus Tyres");
    expect(submenu.className).toContain("invisible");
  });

  it("opens the floating Truck & Bus submenu on hover", () => {
    renderHeader();
    fireEvent.click(productsButton());

    const truckAndBus = screen.getByRole("link", {
      name: /Truck & Bus Tyres/,
    });
    fireEvent.mouseEnter(truckAndBus);

    const submenu = screen.getByTestId("submenu-Truck & Bus Tyres");
    expect(submenu.className).toContain("visible");
    // Anchored directly beside the Truck & Bus item (no large gap).
    expect(submenu.className).toContain("left-full");
    expect(submenu.parentElement?.className).toContain("relative");
    expect(
      within(submenu)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual([
      "/products/truck-bus",
      "/products/truck-bus-tire/pcr-safeway",
      "/products/truck-bus-tire/tbr-safeway",
    ]);
  });

  it("opens the submenu for keyboard users on focus", () => {
    renderHeader();
    fireEvent.click(productsButton());

    const truckAndBus = screen.getByRole("link", {
      name: /Truck & Bus Tyres/,
    });
    fireEvent.focus(truckAndBus);

    expect(
      screen.getByTestId("submenu-Truck & Bus Tyres").className,
    ).toContain("visible");
  });
});

describe("header search", () => {
  it("links the search icon to /search, not the homepage", () => {
    renderHeader();
    const search = screen.getByRole("link", {
      name: en.header.searchAria,
    });
    expect(search.getAttribute("href")).toBe("/search");
  });
});

describe("navigation width", () => {
  it("gives the navigation the space that is left over instead of a fixed column", () => {
    renderHeader();

    const nav = screen.getByRole("navigation", { name: en.header.primaryNav });
    // A flexible middle area: it grows with the space left over, it can
    // shrink below its content and it never pushes the actions out of the bar.
    expect(nav.className).toContain("flex-1");
    expect(nav.className).toContain("min-w-0");
    expect(nav.className).toContain("overflow-hidden");

    const list = nav.querySelector("ul");
    // The labels are laid out at their natural width so they can be measured
    // against the space that is available.
    expect(list?.className).toContain("w-max");
    expect(list?.className).toContain("shrink-0");
  });

  it("keeps the navigation labels on one line", () => {
    renderHeader();

    const nav = screen.getByRole("navigation", { name: en.header.primaryNav });
    const list = nav.querySelector("ul");
    // The top-level items of the bar; the fly-out panels keep their own
    // wrapping.
    const items = Array.from(list?.children ?? []).filter(
      (item): item is HTMLLIElement => item.tagName === "LI",
    );
    expect(items.length).toBeGreaterThan(0);

    for (const item of items) {
      const label = item.querySelector("a, button");
      expect(label?.className, label?.textContent).toContain("whitespace-nowrap");
    }
  });

  it("keeps the mobile menu available below the desktop breakpoint", () => {
    renderHeader();

    const menu = screen.getByRole("button", { name: en.header.openMenu });
    expect(menu.className).toContain("lg:hidden");
  });
});

describe("mobile Products menu", () => {
  it("expands Truck & Bus to reveal Nylon, PCR and TBR", () => {
    renderHeader();

    fireEvent.click(
      screen.getByRole("button", { name: en.header.openMenu }),
    );
    const dialog = screen.getByRole("dialog");

    fireEvent.click(within(dialog).getByRole("button", { name: /^Products/ }));
    fireEvent.click(
      within(dialog).getByRole("button", { name: /Truck & Bus Tyres/ }),
    );

    const links = within(dialog)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(links).toContain("/products/truck-bus");
    expect(links).toContain("/products/truck-bus-tire/pcr-safeway");
    expect(links).toContain("/products/truck-bus-tire/tbr-safeway");
  });
});

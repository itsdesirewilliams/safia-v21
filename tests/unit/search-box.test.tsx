// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
}));

import { SearchBox } from "@/components/home/search-box";
import type { HeroSuggestionPool } from "@/lib/catalogue/suggestions";
import { en } from "@/lib/i18n/dictionaries/en";

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

afterEach(cleanup);

const POOL: HeroSuggestionPool = {
  category: [
    {
      kind: "category",
      label: "Agriculture Tyres",
      hint: "Category",
      query: "Agriculture Tyres",
      href: "/products/agriculture",
    },
  ],
  size: [
    {
      kind: "size",
      label: "6.50-16",
      hint: "Agriculture Tyres",
      query: "6.50-16",
      href: "/products/agriculture/bias-tractor-tyres-tr-1042",
    },
  ],
  name: [
    {
      kind: "name",
      label: "BIAS TRACTOR TYRES",
      hint: "Agriculture Tyres",
      query: "BIAS TRACTOR TYRES",
      href: "/products/agriculture/bias-tractor-tyres-tr-1042",
    },
  ],
};

describe("homepage search box", () => {
  it("stays inline and never links to the dedicated /search page", () => {
    const { container } = render(
      <SearchBox
        suggestions={POOL}
        placeholderPhrases={["6.50-16"]}
        labels={en.search}
        locale="en"
      />,
    );

    expect(container.querySelector('a[href="/search"]')).toBeNull();
    expect(container.querySelector('a[href="/#search"]')).toBeNull();
  });

  it("renders popular searches as buttons that run a search", () => {
    render(
      <SearchBox
        suggestions={POOL}
        placeholderPhrases={["6.50-16"]}
        labels={en.search}
        locale="en"
      />,
    );

    // A chip is a button, not a link to another page.
    expect(
      screen.getByRole("button", { name: "Agriculture Tyres" }),
    ).toBeTruthy();
    expect(screen.getByRole("combobox")).toBeTruthy();
  });
});

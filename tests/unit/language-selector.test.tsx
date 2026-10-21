// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const refresh = vi.fn();
let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn(), refresh }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        // `next/link` intercepts the click; jsdom cannot follow a navigation.
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));

import { LanguageSelector } from "@/components/i18n/language-selector";
import { LOCALE_META, LOCALE_ORDER } from "@/lib/i18n/config";

beforeEach(() => {
  pathname = "/";
  push.mockClear();
  refresh.mockClear();
  document.cookie = "NEXT_LOCALE=; path=/; max-age=0";
});

afterEach(cleanup);

function renderSelector(locale: "en" | "fr" = "en") {
  const utils = render(<LanguageSelector locale={locale} label="Language" />);
  return {
    ...utils,
    rerenderSelector: () =>
      utils.rerender(<LanguageSelector locale={locale} label="Language" />),
  };
}

function openList() {
  fireEvent.click(screen.getByRole("button", { name: /^Language/ }));
  return screen.getByRole("listbox");
}

describe("language selector", () => {
  it("shows the compact locale code in the closed state", () => {
    renderSelector("en");
    expect(screen.getByRole("button", { name: /^Language/ }).textContent).toContain(
      "EN",
    );
  });

  it("lists every supported language with its reference country and a flag", () => {
    renderSelector();
    const list = openList();

    const options = within(list).getAllByRole("option");
    expect(options).toHaveLength(LOCALE_ORDER.length);
    expect(LOCALE_ORDER.length).toBeGreaterThanOrEqual(10);

    for (const locale of LOCALE_ORDER) {
      const meta = LOCALE_META[locale];
      const option = options.find(
        (node) => node.getAttribute("id") === `language-option-${locale}`,
      );
      expect(option, locale).toBeDefined();
      expect(option?.textContent, locale).toContain(meta.nativeName);
      expect(option?.textContent, locale).toContain(meta.country);
      // A deterministic SVG flag keyed by the ISO code, never an emoji.
      expect(
        option?.querySelector(`[data-country-flag="${meta.countryCode}"]`),
        locale,
      ).not.toBeNull();
    }
  });

  it("never renders an emoji flag", () => {
    renderSelector();
    const list = openList();
    expect(list.innerHTML).not.toMatch(/[\u{1F1E6}-\u{1F1FF}]{2}/u);
  });

  it("marks the current language as selected", () => {
    renderSelector("fr");
    const list = openList();
    const selected = within(list)
      .getAllByRole("option")
      .filter((option) => option.getAttribute("aria-selected") === "true");
    expect(selected).toHaveLength(1);
    expect(selected[0].getAttribute("id")).toBe("language-option-fr");
  });

  it("navigates to the same page in the chosen language on the first click", () => {
    renderSelector();
    const list = openList();

    const french = within(list).getByRole("option", { name: /Français/ });
    fireEvent.click(within(french).getByRole("link"));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/fr");
    // The choice is remembered before the navigation so the server treats it
    // as the explicit language.
    expect(document.cookie).toContain("NEXT_LOCALE=fr");
  });

  it("refreshes the server tree once the new language URL has landed", () => {
    const { rerenderSelector } = renderSelector();
    const list = openList();
    const swahili = within(list).getByRole("option", { name: /Kiswahili/ });
    fireEvent.click(within(swahili).getByRole("link"));

    expect(refresh).not.toHaveBeenCalled();

    // The router lands on the new URL, then the tree is refetched so the page
    // is actually rendered in the chosen language.
    pathname = "/sw";
    rerenderSelector();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("does not navigate when the current language is chosen again", () => {
    renderSelector();
    const list = openList();
    const english = within(list).getByRole("option", { name: /English/ });
    fireEvent.click(within(english).getByRole("link"));

    expect(push).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("switches back to the unprefixed English URL", () => {
    pathname = "/fr/about-us";
    renderSelector("fr");
    const list = openList();
    const english = within(list).getByRole("option", { name: /English/ });
    fireEvent.click(within(english).getByRole("link"));

    expect(push).toHaveBeenCalledWith("/about-us");
  });

  it("is driven by the keyboard", () => {
    renderSelector();
    const list = openList();

    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(list.getAttribute("aria-activedescendant")).toBe(
      "language-option-fr",
    );

    fireEvent.keyDown(list, { key: "End" });
    expect(list.getAttribute("aria-activedescendant")).toBe(
      "language-option-ar",
    );

    fireEvent.keyDown(list, { key: "Enter" });
    expect(push).toHaveBeenCalledWith("/ar");
  });
});

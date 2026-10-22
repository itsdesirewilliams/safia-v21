// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pathname: "/",
  navigateToPath: vi.fn(),
}));

vi.mock("@/lib/i18n/navigate", () => ({
  navigateToPath: (href: string) => mocks.navigateToPath(href),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    prefetch,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    prefetch?: boolean;
  }) => {
    // `next/link` consumes `prefetch`; a plain anchor does not.
    void prefetch;
    return (
      <a
        href={href}
        {...props}
        onClick={(event) => {
          onClick?.(event);
        }}
      >
        {children}
      </a>
    );
  },
}));

import { LanguageSelector } from "@/components/i18n/language-selector";
import { LOCALE_META, LOCALE_ORDER } from "@/lib/i18n/config";

beforeEach(() => {
  mocks.pathname = "/";
  mocks.navigateToPath.mockClear();
  document.cookie = "NEXT_LOCALE=; path=/; max-age=0";
});

afterEach(cleanup);

function renderSelector(locale: "en" | "fr" = "en") {
  return render(<LanguageSelector locale={locale} label="Language" />);
}

function openList() {
  fireEvent.click(screen.getByRole("button", { name: /^Language/ }));
  return screen.getByRole("listbox");
}

describe("language selector", () => {
  it("shows the compact locale code in the closed state", () => {
    renderSelector("en");
    expect(
      screen.getByRole("button", { name: /^Language/ }).textContent,
    ).toContain("EN");
  });

  it("lists every supported language with its reference country and a flag", () => {
    renderSelector();
    const list = openList();

    const options = within(list).getAllByRole("option");
    expect(options).toHaveLength(LOCALE_ORDER.length);
    expect(LOCALE_ORDER.length).toBeGreaterThanOrEqual(14);

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

  it("marks the right-to-left languages in the markup", () => {
    renderSelector();
    const list = openList();

    const rtl = LOCALE_ORDER.filter((locale) => LOCALE_META[locale].dir === "rtl");
    expect(rtl.length).toBeGreaterThanOrEqual(2);

    for (const locale of LOCALE_ORDER) {
      const option = list.querySelector(`#language-option-${locale}`);
      const link = option?.querySelector("a");
      // The language name follows the direction of its own script.
      expect(link?.getAttribute("lang"), locale).toBe(locale);
    }
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

  it("loads the same page in the chosen language on the first click", () => {
    renderSelector();
    const list = openList();

    const french = within(list).getByRole("option", { name: /Français/ });
    fireEvent.click(within(french).getByRole("link"));

    expect(mocks.navigateToPath).toHaveBeenCalledTimes(1);
    expect(mocks.navigateToPath).toHaveBeenCalledWith("/fr");
    // The choice is remembered before the navigation, so the server treats
    // it as the explicit language.
    expect(document.cookie).toContain("NEXT_LOCALE=fr");
  });

  it("does not navigate when the current language is chosen again", () => {
    renderSelector();
    const list = openList();
    const english = within(list).getByRole("option", { name: /English/ });
    fireEvent.click(within(english).getByRole("link"));

    expect(mocks.navigateToPath).not.toHaveBeenCalled();
  });

  it("switches back to the unprefixed English URL", () => {
    mocks.pathname = "/fr/about-us";
    renderSelector("fr");
    const list = openList();
    const english = within(list).getByRole("option", { name: /English/ });
    fireEvent.click(within(english).getByRole("link"));

    expect(mocks.navigateToPath).toHaveBeenCalledWith("/about-us");
  });

  it("is driven by the keyboard", () => {
    renderSelector();
    const list = openList();

    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(list.getAttribute("aria-activedescendant")).toBe(
      "language-option-fr",
    );

    const last = LOCALE_ORDER[LOCALE_ORDER.length - 1];
    fireEvent.keyDown(list, { key: "End" });
    expect(list.getAttribute("aria-activedescendant")).toBe(
      `language-option-${last}`,
    );

    fireEvent.keyDown(list, { key: "Enter" });
    expect(mocks.navigateToPath).toHaveBeenCalledWith(`/${last}`);
  });
});

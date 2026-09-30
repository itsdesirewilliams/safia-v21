import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DEFAULT_THEME_ID,
  getThemeDefinition,
  isThemeId,
  parseThemeId,
  THEMES,
} from "@/lib/theme/config";

describe("theme registry", () => {
  it("keeps classic as the default and preserves it", () => {
    expect(DEFAULT_THEME_ID).toBe("classic");
    expect(THEMES.map((theme) => theme.id)).toContain("classic");
  });

  it("includes the Safeway Green theme", () => {
    const green = THEMES.find((theme) => theme.id === "safeway-green");
    expect(green).toBeDefined();
    expect(green?.label).toBe("Safeway Green");
    expect(green?.swatch.toLowerCase()).toBe("#00703d");
  });

  it("validates and parses ids defensively", () => {
    expect(isThemeId("classic")).toBe(true);
    expect(isThemeId("safeway-green")).toBe(true);
    expect(isThemeId("neon")).toBe(false);
    expect(isThemeId(undefined)).toBe(false);
    expect(parseThemeId("classic")).toBe("classic");
    expect(parseThemeId(null)).toBeNull();
    expect(getThemeDefinition("classic").id).toBe("classic");
  });
});

describe("theme tokens in globals.css", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

  it("defines the semantic token surface", () => {
    for (const token of [
      "--color-primary:",
      "--color-primary-hover:",
      "--color-primary-dark:",
      "--color-primary-deep:",
      "--color-primary-light:",
      "--color-accent:",
      "--color-accent-hover:",
      "--color-surface:",
      "--color-surface-muted:",
      "--color-border:",
      "--color-text:",
      "--color-text-muted:",
    ]) {
      expect(css).toContain(token);
    }
  });

  it("keeps Theme 1 and adds the green Theme 2", () => {
    expect(css).toContain("#0b63f6"); // classic primary preserved
    expect(css).toContain('[data-theme="safeway-green"]');
    expect(css).toContain("#00703d"); // green primary
  });

  it("routes the legacy brand/accent/ink utilities through the theme", () => {
    const greenBlock = css.slice(css.indexOf('[data-theme="safeway-green"]'));
    expect(greenBlock).toContain("--color-brand-600: var(--color-primary)");
    expect(greenBlock).toContain("--color-accent-500: var(--color-accent)");
    expect(greenBlock).toContain("--color-ink-950:");
  });
});

describe("themed gradients", () => {
  const files = [
    "src/app/(site)/page.tsx",
    "src/components/contact/contact-aside.tsx",
    "src/components/home/category-visual.tsx",
    "src/components/home/youtube-tour.tsx",
    "src/components/quality-first/quality-first-cta.tsx",
  ];

  it("uses theme-token color-mix instead of literal blue/orange rgba", () => {
    for (const file of files) {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      expect(source).not.toContain("rgba(11,99,246");
      expect(source).not.toContain("rgba(255,106,0");
      expect(source).toContain("color-mix(in_srgb,var(--color-primary)");
    }
  });
});

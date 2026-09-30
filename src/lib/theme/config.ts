/**
 * Website theme registry (pure, dependency-free).
 *
 * A theme is a named set of semantic design tokens applied to the public site
 * through the `data-theme` attribute on `<html>` (see `globals.css`). The
 * active theme is chosen by an Admin and stored in the `site_settings` table;
 * this module owns the *vocabulary* — the valid ids, the default, and the
 * display metadata — and never touches the database or the network, so both the
 * server and the admin UI can share it.
 *
 * Adding a third theme is a one-line change here plus a matching
 * `[data-theme="…"]` token block in `globals.css`; no component changes.
 */

export const THEME_IDS = ["classic", "safeway-green"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/** Theme 1 — the existing baseline. Never removed. */
export const DEFAULT_THEME_ID: ThemeId = "classic";

export type ThemeDefinition = {
  id: ThemeId;
  /** Admin-facing name. */
  label: string;
  /** Admin-facing one-line description. */
  description: string;
  /** A representative swatch colour for the admin picker. */
  swatch: string;
};

export const THEMES: readonly ThemeDefinition[] = [
  {
    id: "classic",
    label: "Classic",
    description: "The existing Safeway Tyre palette (blue and orange).",
    swatch: "#0b63f6",
  },
  {
    id: "safeway-green",
    label: "Safeway Green",
    description:
      "A premium green theme with a full tonal palette derived from #00703D.",
    swatch: "#00703d",
  },
];

/** The `site_settings` key that stores the active theme. */
export const THEME_SETTING_KEY = "theme";
export const SITE_SETTINGS_TABLE = "site_settings";
/** Cache tag invalidated when the theme changes. */
export const THEME_CACHE_TAG = "site-theme";

export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === "string" &&
    (THEME_IDS as readonly string[]).includes(value)
  );
}

/** A valid `ThemeId`, or `null` for anything unrecognized. */
export function parseThemeId(value: unknown): ThemeId | null {
  return isThemeId(value) ? value : null;
}

export function getThemeDefinition(id: ThemeId): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}

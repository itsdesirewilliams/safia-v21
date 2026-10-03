import { Anek_Devanagari } from "next/font/google";
import localFont from "next/font/local";

/**
 * Safeway Tyre typography system.
 *
 * Mona Sans is the only face on the public website: the official Mona Sans
 * variable webfont (weights 200–900) carries headings, body text, navigation,
 * buttons, forms, labels and product information. The display scale sets larger
 * sizes and heavier weights of this same face rather than switching typeface.
 *
 * Devanagari — Anek Devanagari, applied only where Devanagari copy is required
 * (`--font-devanagari`). Not preloaded because no Devanagari copy ships yet.
 *
 * Mona Sans is self-hosted through `next/font`, which hashes and preloads it and
 * emits metric-adjusted fallbacks to limit layout shift.
 */

export const monaSans = localFont({
  src: "./fonts/mona-sans-latin-wght-normal.woff2",
  variable: "--font-mona-sans",
  weight: "200 900",
  style: "normal",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

/**
 * Mona Sans Condensed, used only for Pattern Codes.
 *
 * The shipped base face above carries the weight axis only; this is the full
 * Mona Sans variable (weight + width, 75–125). The `.pattern-code-font` utility
 * pins the width axis to 87.5 — condensed, but with more breathing room than the
 * fully condensed 75. It is not preloaded: it downloads only on the product
 * pages that render a Pattern Code.
 */
export const monaSansCondensed = localFont({
  src: "./fonts/mona-sans-condensed-latin.woff2",
  variable: "--font-mona-sans-condensed",
  weight: "200 900",
  style: "normal",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const anekDevanagari = Anek_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-anek-devanagari",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

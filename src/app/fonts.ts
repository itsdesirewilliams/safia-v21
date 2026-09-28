import { Anek_Devanagari } from "next/font/google";
import localFont from "next/font/local";

/**
 * Safeway Tyre typography system.
 *
 * Display — Wolling: heroes, page titles, section headings and other
 * intentional display text. It is a single static weight, so it is never used
 * for body copy or dense UI.
 *
 * Body/UI — Mona Sans: the official Mona Sans variable webfont (weights
 * 200–900) for body text, navigation, buttons, forms, labels and product
 * information.
 *
 * Devanagari — Anek Devanagari, applied only where Devanagari copy is required
 * (`--font-devanagari`). Not preloaded because no Devanagari copy ships yet.
 *
 * Both Latin faces are self-hosted through `next/font`, which hashes and
 * preloads them and emits metric-adjusted fallbacks to limit layout shift.
 */

export const wolling = localFont({
  src: "./fonts/Wolling.ttf",
  variable: "--font-wolling",
  // Wolling ships as one regular cut. Declaring the usable range keeps the
  // designed letterforms intact instead of letting the browser fake-bold them
  // for the 700/800 heading weights.
  weight: "100 900",
  style: "normal",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const monaSans = localFont({
  src: "./fonts/mona-sans-latin-wght-normal.woff2",
  variable: "--font-mona-sans",
  weight: "200 900",
  style: "normal",
  display: "swap",
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

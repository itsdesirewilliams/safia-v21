import { Anek_Devanagari, Inter } from "next/font/google";

/**
 * Safeway Tyre typography system.
 *
 * Inter is the single primary typeface for all Latin UI text: display, h1–h3,
 * body, navigation, buttons, labels, metadata and product information.
 *
 * Anek Devanagari is configured for Devanagari/Hindi text and is applied only
 * where Devanagari copy is actually required (`font-devanagari`). It is not
 * preloaded because no Devanagari copy ships yet.
 */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const anekDevanagari = Anek_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-anek-devanagari",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

import { Archivo } from "next/font/google";

/**
 * Archivo — the active site typeface for all UI text: headings, body,
 * navigation, buttons, forms, labels and cards. The final display font is a
 * separate future design decision (see docs/missing-inputs.md); until then
 * Archivo is the only font.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

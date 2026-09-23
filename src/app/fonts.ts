import { Archivo } from "next/font/google";
import localFont from "next/font/local";

/**
 * Alfabet — primary / display typeface. The files in `./fonts` are the
 * Fontspring DEMO cuts supplied in `assets/fonts`; licensing must be verified
 * before production (see `docs/missing-inputs.md`).
 */
export const alfabet = localFont({
  src: [
    { path: "./fonts/alfabet-light.otf", weight: "300", style: "normal" },
    { path: "./fonts/alfabet-regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/alfabet-medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/alfabet-semibold.otf", weight: "600", style: "normal" },
    { path: "./fonts/alfabet-bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/alfabet-black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-alfabet",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

/** Archivo — secondary / body typeface (Google Fonts). */
export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

import { createElement } from "react";

export type RevealTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Retained for call-site compatibility; no longer used. */
  delay?: number;
};

/**
 * RevealText — renders the heading immediately.
 *
 * The previous masked reveal wrapped the text in an overflow-hidden mask and
 * started it at `yPercent: 120, opacity: 0`, which hid meaningful headings
 * until GSAP initialised and the element scrolled into view. It now renders the
 * plain heading so it is present and readable on first paint.
 */
export function RevealText({ text, as = "h2", className }: RevealTextProps) {
  return createElement(as, { className }, text);
}

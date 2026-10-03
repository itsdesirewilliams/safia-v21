import { cn } from "@/lib/cn";

export type RevealVariant = "up" | "fade" | "mask" | "scale";

export type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Retained for call-site compatibility; no longer used. */
  delay?: number;
  variant?: RevealVariant;
};

/**
 * Reveal — an always-visible wrapper.
 *
 * Content must never depend on JavaScript, hydration or scrolling to become
 * visible, so this renders its children immediately with no hidden initial
 * state (no `opacity: 0`, clip, or transform). The previous GSAP/ScrollTrigger
 * reveal was removed deliberately: a page that paints complete on first render
 * is preferable to content that appears late or only after scrolling.
 *
 * The `delay`/`variant` props are kept so existing call sites stay unchanged.
 */
export function Reveal({ children, className }: RevealProps) {
  return <div className={cn(className)}>{children}</div>;
}

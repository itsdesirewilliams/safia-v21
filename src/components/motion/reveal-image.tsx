export type RevealImageProps = {
  children: React.ReactNode;
  className?: string;
  /** Retained for call-site compatibility; no longer used. */
  delay?: number;
};

/**
 * RevealImage — an always-visible media wrapper.
 *
 * The previous clip-path wipe hid the media (`inset(0% 0% 100% 0%)`) until GSAP
 * ran and the element scrolled into view. It now renders the media normally so
 * it is visible on first paint.
 */
export function RevealImage({ children, className }: RevealImageProps) {
  return <div className={className}>{children}</div>;
}

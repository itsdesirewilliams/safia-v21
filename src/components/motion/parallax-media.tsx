export type ParallaxMediaProps = {
  children: React.ReactNode;
  className?: string;
  /** Retained for call-site compatibility; no longer used. */
  amount?: number;
};

/**
 * ParallaxMedia — a plain, always-visible wrapper.
 *
 * The subtle scroll-linked drift was removed: it required JS to run (and began
 * from a transformed state) for content whose primary requirement is to render
 * immediately and identically everywhere.
 */
export function ParallaxMedia({ children, className }: ParallaxMediaProps) {
  return <div className={className}>{children}</div>;
}

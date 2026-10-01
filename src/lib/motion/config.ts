/**
 * The single source of motion values for the public site.
 *
 * Every reveal/parallax primitive reads from here, so the whole website shares
 * one choreography: the same premium easing, a restrained distance scale and a
 * small stagger vocabulary. Durations are in seconds (GSAP); `ms` mirrors the
 * CSS side. Tune the feel here, never per-component.
 *
 * Bands (per the motion brief):
 *  - micro  150–250ms · ui 250–400ms · reveal 500–800ms · section 700–1200ms
 */
export const MOTION = {
  duration: {
    micro: 0.2,
    ui: 0.32,
    reveal: 0.7,
    section: 0.95,
  },
  // One premium easing across the site; a gentle inOut for masked wipes.
  ease: {
    premium: "power3.out",
    inOut: "power2.inOut",
  },
  distance: {
    sm: 16,
    md: 28,
    lg: 44,
  },
  stagger: {
    tight: 0.05,
    base: 0.08,
    wide: 0.12,
  },
  parallax: {
    /** Maximum vertical drift, in px, for a parallax element (very subtle). */
    subtle: 22,
  },
} as const;

/** GSAP matchMedia query used to enable motion only when allowed. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

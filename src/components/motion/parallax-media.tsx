"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { MOTION, MOTION_OK } from "@/lib/motion/config";
import { gsap } from "@/lib/motion/gsap";

export type ParallaxMediaProps = {
  children: React.ReactNode;
  className?: string;
  /** Maximum vertical drift, in px (defaults to the site's very subtle value). */
  amount?: number;
};

/**
 * ParallaxMedia — a very subtle depth effect for major media. The element drifts
 * a small, fixed number of pixels against the scroll (no obvious "parallax
 * website" feel). Scroll-linked with GSAP ScrollTrigger `scrub`, so it never
 * triggers React renders. Disabled entirely under reduced motion.
 */
export function ParallaxMedia({
  children,
  className,
  amount = MOTION.parallax.subtle,
}: ParallaxMediaProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) {
        return;
      }
      const trigger = el.parentElement ?? el;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          el,
          { y: -amount },
          {
            y: amount,
            ease: "none",
            scrollTrigger: {
              trigger,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [amount] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

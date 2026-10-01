"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { MOTION, MOTION_OK } from "@/lib/motion/config";
import { gsap } from "@/lib/motion/gsap";

export type RevealImageProps = {
  children: React.ReactNode;
  className?: string;
  /** Delay in milliseconds. */
  delay?: number;
};

/**
 * RevealImage — an After-Effects-style media reveal. The container wipes open
 * via `clip-path` while the media (marked `data-reveal-media`, or the container
 * itself) settles from a slight overscale (1.06 → 1). Use for selected major
 * images only, not every thumbnail.
 *
 * Runs once on scroll-in; reduced-motion users get the final composition with
 * no movement, and no-JS visitors see the image normally.
 */
export function RevealImage({ children, className, delay = 0 }: RevealImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) {
        return;
      }
      const media =
        (el.querySelector("[data-reveal-media]") as HTMLElement | null) ?? el;

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          delay: delay / 1000,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
        tl.fromTo(
          el,
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: MOTION.duration.section,
            ease: MOTION.ease.inOut,
            clearProps: "clipPath",
          },
          0,
        );
        tl.fromTo(
          media,
          { scale: 1.06 },
          { scale: 1, duration: MOTION.duration.section, ease: MOTION.ease.premium },
          0,
        );
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [delay] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

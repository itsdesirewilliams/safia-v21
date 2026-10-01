"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { cn } from "@/lib/cn";
import { MOTION, MOTION_OK } from "@/lib/motion/config";
import { gsap } from "@/lib/motion/gsap";

/**
 * AccentLine — the small orange punctuation mark from the motion brief: a thin
 * rule that sweeps into place (scaleX 0 → 1, origin left) as its section
 * arrives. Orange is used only as an accent, never as a large surface.
 */
export function AccentLine({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) {
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          el,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            transformOrigin: "left center",
            duration: MOTION.duration.reveal,
            ease: MOTION.ease.premium,
            scrollTrigger: { trigger: el, start: "top 94%", once: true },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span
      ref={ref}
      className={cn(
        "block h-0.5 w-12 origin-left rounded-full bg-accent-500",
        className,
      )}
    />
  );
}

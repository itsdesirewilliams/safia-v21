"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { cn } from "@/lib/cn";
import { MOTION, MOTION_OK } from "@/lib/motion/config";
import { gsap } from "@/lib/motion/gsap";

export type RevealVariant = "up" | "fade" | "mask" | "scale";

export type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger/lead delay in milliseconds. */
  delay?: number;
  variant?: RevealVariant;
};

/**
 * Reveal — the workhorse for composing an element into the viewport with GSAP +
 * ScrollTrigger. Not a plain fade: each variant pairs opacity with a movement
 * idea (up = rise, mask = clip-path wipe, scale = settle, fade = opacity only).
 *
 * Content is rendered in its final state and only animated from a `from` state
 * once motion is allowed, so it is never hidden by CSS: reduced-motion users and
 * no-JS visitors see everything immediately. ScrollTriggers are created inside
 * `gsap.matchMedia` and reverted on unmount (no leaks, no scroll listeners).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) {
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const from =
          variant === "fade"
            ? { opacity: 0 }
            : variant === "mask"
              ? {
                  opacity: 0,
                  y: MOTION.distance.sm,
                  clipPath: "inset(0% 0% 100% 0%)",
                }
              : variant === "scale"
                ? { opacity: 0, scale: 0.97 }
                : { opacity: 0, y: MOTION.distance.md };

        gsap.fromTo(el, from, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: MOTION.duration.reveal,
          ease: MOTION.ease.premium,
          delay: delay / 1000,
          clearProps: "clipPath,transform",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [variant, delay] },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}

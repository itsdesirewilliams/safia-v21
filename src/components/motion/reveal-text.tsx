"use client";

import { createElement, useRef } from "react";
import { useGSAP } from "@gsap/react";

import { MOTION, MOTION_OK } from "@/lib/motion/config";
import { gsap } from "@/lib/motion/gsap";

export type RevealTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Delay in milliseconds. */
  delay?: number;
};

/**
 * RevealText — a masked heading reveal. The heading is wrapped in an
 * overflow-hidden mask and slides up into place (translateY ≈ 20% → 0) with a
 * fade, GSAP-driven and scroll-triggered.
 *
 * The text is never split, so it stays fully readable to assistive tech and
 * descenders are protected by the mask's bottom padding. Reduced-motion users
 * and no-JS visitors see the heading immediately.
 */
export function RevealText({
  text,
  as = "h2",
  className,
  delay = 0,
}: RevealTextProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const inner = wrap?.firstElementChild as HTMLElement | null;
      if (!wrap || !inner) {
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          inner,
          { yPercent: 120, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: MOTION.duration.section,
            ease: MOTION.ease.premium,
            delay: delay / 1000,
            scrollTrigger: { trigger: wrap, start: "top 90%", once: true },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: wrapRef, dependencies: [text, delay] },
  );

  return (
    <span
      ref={wrapRef}
      className="block -mb-[0.18em] overflow-hidden pb-[0.18em]"
    >
      {createElement(as, { className }, text)}
    </span>
  );
}

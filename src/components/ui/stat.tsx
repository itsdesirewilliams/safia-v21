"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

export type StatProps = {
  value: number;
  suffix?: string;
  label: string;
  tone?: "light" | "dark";
  className?: string;
};

/**
 * A single factual statistic with a restrained count-up when it scrolls into
 * view. The final value is server-rendered, so it is always present for
 * no-JS and assistive tech; the animation only updates the DOM text directly.
 * Numbers must come from authoritative data — never invented.
 */
export function Stat({
  value,
  suffix,
  label,
  tone = "light",
  className,
}: StatProps) {
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = numberRef.current;
    if (!element) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;
    let first = true;
    let animated = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        // Skip the initial synchronous callback so stats already on screen
        // keep their server-rendered value (no flash on load).
        if (first) {
          first = false;
          if (entry.isIntersecting) {
            return;
          }
        }

        if (!entry.isIntersecting || animated) {
          return;
        }

        animated = true;
        observer.disconnect();

        const duration = 1100;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = `${Math.round(eased * value)}${suffix ?? ""}`;
          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          }
        };

        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, suffix]);

  return (
    <div className={cn("flex flex-col", className)}>
      <span
        ref={numberRef}
        className={cn(
          "text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl",
          tone === "light" ? "text-ink-950" : "text-white",
        )}
      >
        {value}
        {suffix}
      </span>
      <span
        className={cn(
          "mt-1 text-xs font-medium uppercase tracking-[0.16em]",
          tone === "light" ? "text-ink-500" : "text-white/50",
        )}
      >
        {label}
      </span>
    </div>
  );
}

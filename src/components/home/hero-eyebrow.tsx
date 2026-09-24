"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

const PHRASES = [
  "Exporting Durable Tires Worldwide",
  "Global Tire Manufacturing",
  "Heavy-Duty Tire Solutions",
  "Agricultural & Industrial Tires",
  "Truck & Bus Tire Solutions",
  "Built for Global Markets",
] as const;

const INTERVAL_MS = 3800;
const FADE_MS = 450;

function TyreMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.25" />
      <path d="M12 3v2.75M12 18.25V21M3 12h2.75M18.25 12H21M5.64 5.64l1.95 1.95M16.41 16.41l1.95 1.95M18.36 5.64l-1.95 1.95M7.59 16.41l-1.95 1.95" />
    </svg>
  );
}

/**
 * Hero-only eyebrow. Unlike the shared section `Eyebrow`, it uses a restrained
 * tyre mark rather than the orange status dot, and gently crossfades through
 * short SEO phrases. Decorative motion only — reduced-motion users see the
 * first phrase statically.
 */
export function HeroEyebrow() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = setInterval(() => {
      setVisible(false);
      timeoutRef.current = setTimeout(() => {
        setIndex((current) => (current + 1) % PHRASES.length);
        setVisible(true);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <span className="text-eyebrow inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1.5 pl-2.5 pr-3.5 text-white/80">
      <TyreMark className="h-4 w-4 shrink-0 text-accent-500" />
      <span
        className={cn(
          "transition-opacity duration-500 ease-out motion-reduce:transition-none",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        {PHRASES[index]}
      </span>
    </span>
  );
}
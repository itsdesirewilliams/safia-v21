"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import type { InstagramImage } from "@/lib/media/instagram";
import { SITE } from "@/lib/site";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * The homepage Instagram carousel. The local images slide continuously to the
 * left as a seamless loop: the set is rendered twice and the track is translated
 * by -50%, and a uniform right margin (not `gap`) keeps the wrap exact with no
 * visible jump. Motion is CSS-driven, so there is no stop/start between slides.
 * It starts automatically once the section scrolls into view and pauses only
 * while the tab is hidden; `prefers-reduced-motion` drops the animation and
 * leaves an ordinary horizontal scroll instead. Every tile links to the Safeway
 * Tyre Instagram profile. No API is used.
 */

/** Fixed slide size plus its right margin; percentages cannot be used on a
 * max-content track. The margin here must match `marquee`'s translation basis. */
const SLIDE_CLASS =
  "relative mr-4 aspect-[4/5] w-52 shrink-0 overflow-hidden rounded-lg bg-ink-100 sm:w-60 lg:w-64";

export function InstagramStrip({
  images,
}: {
  images: readonly InstagramImage[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  // Start the loop only when the section is on screen.
  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Pause while the tab is hidden (the only technical pause).
  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  if (images.length === 0) {
    return null;
  }

  // Render the set twice so the -50% translation loops without a visible jump.
  const slides = [...images, ...images];
  const playing = !reduceMotion && inView && pageVisible;

  return (
    <div
      ref={containerRef}
      className={cn("relative", reduceMotion ? "overflow-x-auto" : "overflow-hidden")}
    >
      <ul
        className={cn(
          "flex w-max",
          !reduceMotion && "animate-marquee will-change-transform",
        )}
        style={
          reduceMotion ? undefined : { animationPlayState: playing ? "running" : "paused" }
        }
      >
        {slides.map((image, index) => (
          <li key={`${image.url}-${index}`} className={SLIDE_CLASS}>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${image.alt} — open Safeway Tyre on Instagram`}
              className="group absolute inset-0 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 13rem, (max-width: 1024px) 15rem, 16rem"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

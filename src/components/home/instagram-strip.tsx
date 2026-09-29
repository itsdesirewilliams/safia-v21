"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

import {
  INSTAGRAM_CAROUSEL_INTERVAL_MS,
  type InstagramImage,
} from "@/lib/media/instagram";
import { SITE } from "@/lib/site";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/** Must match the carousel's `gap-4` (1rem). */
const GAP_PX = 16;

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
      />
    </svg>
  );
}

/**
 * The homepage Instagram carousel: the local images slide horizontally through
 * a scroll track, advancing automatically every five seconds and looping
 * continuously (the set is rendered twice so the wrap is seamless). It supports
 * native touch/trackpad swiping plus explicit previous/next controls, and every
 * tile links to the Safeway Tyre Instagram profile. No API is used.
 */
export function InstagramStrip({
  images,
}: {
  images: readonly InstagramImage[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Render the set twice so the loop can wrap without a visible jump.
  const slides = [...images, ...images];

  const stepSize = useCallback(() => {
    const el = scrollerRef.current;
    const slide = el?.querySelector<HTMLElement>("[data-slide]");
    return slide ? slide.offsetWidth + GAP_PX : (el?.clientWidth ?? 1);
  }, []);

  const scrollBySlide = useCallback(
    (direction: 1 | -1) => {
      const el = scrollerRef.current;
      if (!el) {
        return;
      }

      const half = el.scrollWidth / 2;

      // Keep the position inside the first copy; content is identical either
      // side of the midpoint, so the reset is invisible.
      if (el.scrollLeft >= half) {
        el.scrollLeft -= half;
      } else if (direction < 0 && el.scrollLeft < stepSize()) {
        el.scrollLeft += half;
      }

      el.scrollBy({
        left: direction * stepSize(),
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [reduceMotion, stepSize],
  );

  useEffect(() => {
    if (images.length <= 1 || reduceMotion) {
      return;
    }
    const timer = setInterval(
      () => scrollBySlide(1),
      INSTAGRAM_CAROUSEL_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [images.length, reduceMotion, scrollBySlide]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollBySlide(-1)}
          aria-label="Previous Instagram image"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 shadow-soft transition-colors hover:border-ink-300 hover:bg-ink-50"
        >
          <Chevron direction="left" />
        </button>
        <button
          type="button"
          onClick={() => scrollBySlide(1)}
          aria-label="Next Instagram image"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 shadow-soft transition-colors hover:border-ink-300 hover:bg-ink-50"
        >
          <Chevron direction="right" />
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((image, index) => (
          <a
            key={`${image.url}-${index}`}
            data-slide
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${image.alt} — open Safeway Tyre on Instagram`}
            className="group relative aspect-[4/5] w-[72%] shrink-0 snap-start overflow-hidden rounded-lg bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]"
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 72vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

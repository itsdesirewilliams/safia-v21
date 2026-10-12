"use client";

import { useRef, useState } from "react";

const SWIPE_THRESHOLD_PX = 40;

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
 * A single-image catalogue viewer for the radial ranges (TBR, PCR).
 *
 * It shows one catalogue page at a time and moves only on an explicit action —
 * previous/next, the arrow keys when focused, or a horizontal swipe. It never
 * auto-advances (a catalogue needs time to read), shows no thumbnail strip, and
 * uses the same collection, ordering and navigation at every viewport width.
 * Each page keeps its native landscape ratio (`h-auto w-full`, never
 * `object-cover`), so nothing is cropped or stretched.
 */
export function RangeCatalogueSlider({
  slides,
  label,
}: {
  slides: readonly string[];
  label: string;
}) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const count = slides.length;

  if (count === 0) {
    return null;
  }

  const atStart = index <= 0;
  const atEnd = index >= count - 1;

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(count - 1, next)));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    }
  }

  function onTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) {
      return;
    }

    const end = event.changedTouches[0]?.clientX ?? start;
    const delta = end - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) {
      return;
    }

    goTo(delta < 0 ? index + 1 : index - 1);
  }

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <div className="relative overflow-hidden rounded-lg border border-ink-200 bg-ink-100 shadow-card">
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {slides.map((src, slideIndex) => (
            <figure
              key={src}
              className="w-full shrink-0"
              aria-hidden={slideIndex !== index}
            >
              {/* Native aspect ratio preserved: never cropped or stretched. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${label} — page ${slideIndex + 1} of ${count}`}
                loading={slideIndex === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                className="block h-auto w-full"
              />
            </figure>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={atStart}
              aria-label="Previous catalogue page"
              className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ink-950/10 bg-white/90 text-ink-900 shadow-pop backdrop-blur transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none sm:left-4"
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={atEnd}
              aria-label="Next catalogue page"
              className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ink-950/10 bg-white/90 text-ink-900 shadow-pop backdrop-blur transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none sm:right-4"
            >
              <Chevron direction="right" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <p
          data-testid="range-catalogue-counter"
          className="mt-4 text-center text-sm font-medium tabular-nums text-ink-600"
          aria-live="polite"
          aria-atomic="true"
        >
          {index + 1} / {count}
        </p>
      )}
    </div>
  );
}

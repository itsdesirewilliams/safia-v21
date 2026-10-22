"use client";

import { useRef, useState, useSyncExternalStore } from "react";

import { CountryFlag } from "@/components/ui/country-flag";
import type { Testimonial } from "@/lib/homepage";

const SWIPE_THRESHOLD_PX = 40;

/** How many cards are visible at each breakpoint. */
const CARDS_PER_VIEW = { mobile: 1, tablet: 2, desktop: 3 } as const;

function cardsForWidth(width: number): number {
  if (width >= 1024) {
    return CARDS_PER_VIEW.desktop;
  }
  return width >= 640 ? CARDS_PER_VIEW.tablet : CARDS_PER_VIEW.mobile;
}

/** The number of visible cards follows the viewport. */
function subscribeToViewport(onChange: () => void): () => void {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function useCardsPerView(): number {
  return useSyncExternalStore(
    subscribeToViewport,
    () => cardsForWidth(window.innerWidth),
    // The server render uses the desktop layout.
    () => CARDS_PER_VIEW.desktop,
  );
}

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

export type TestimonialCarouselProps = {
  testimonials: readonly Testimonial[];
  /** Accessible name of the carousel region. */
  label: string;
  previousLabel: string;
  nextLabel: string;
};

/**
 * The homepage testimonial carousel.
 *
 * One collection, one component, every viewport: three cards side by side on
 * the desktop, two on a tablet and one on a phone. The cards keep the same
 * size within a page, the movement is a restrained horizontal slide, and it
 * never auto-advances. A visitor can move with the buttons, with the arrow
 * keys when the carousel has focus, or with a swipe on a touch screen.
 */
export function TestimonialCarousel({
  testimonials,
  label,
  previousLabel,
  nextLabel,
}: TestimonialCarouselProps) {
  const perPage = useCardsPerView();
  const [requestedPage, setRequestedPage] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  const count = testimonials.length;
  const pages = Math.max(1, Math.ceil(count / perPage));
  // The requested page is clamped on read, so shrinking the collection or
  // widening the viewport can never leave the carousel on a missing page.
  const page = Math.min(requestedPage, pages - 1);

  function goTo(next: number) {
    setRequestedPage(Math.max(0, Math.min(pages - 1, next)));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(page - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(page + 1);
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

    goTo(delta < 0 ? page + 1 : page - 1);
  }

  if (count === 0) {
    return null;
  }

  const atStart = page <= 0;
  const atEnd = page >= pages - 1;
  const step = 100 / perPage;

  return (
    <div
      ref={regionRef}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <div className="relative">
        {/* The viewport clips the track so the next page never leaks into the
            layout. */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${page * step}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={`${testimonial.author}-${testimonial.location}`}
                className="w-full shrink-0 px-1 sm:w-1/2 lg:w-1/3"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <figure className="flex h-full flex-col rounded-card border border-ink-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-ink-300 hover:shadow-card motion-reduce:hover:translate-y-0">
                  <blockquote className="text-base leading-relaxed text-ink-800">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 space-y-1">
                    <p className="text-sm font-semibold text-ink-950">
                      {testimonial.author}
                    </p>
                    <p className="flex items-start gap-1.5 text-sm font-normal text-ink-500">
                      <CountryFlag
                        code={testimonial.countryCode}
                        country={testimonial.location}
                        className="mt-0.5 shrink-0"
                      />
                      <span>{testimonial.location}</span>
                    </p>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={atStart}
            aria-label={previousLabel}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 transition-colors hover:border-ink-300 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none"
          >
            <Chevron direction="left" />
          </button>
          <p
            data-testid="testimonial-carousel-counter"
            className="min-w-14 text-center text-sm font-medium tabular-nums text-ink-600"
            aria-live="polite"
            aria-atomic="true"
          >
            {page + 1} / {pages}
          </p>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={atEnd}
            aria-label={nextLabel}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 transition-colors hover:border-ink-300 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none"
          >
            <Chevron direction="right" />
          </button>
        </div>
      )}
    </div>
  );
}

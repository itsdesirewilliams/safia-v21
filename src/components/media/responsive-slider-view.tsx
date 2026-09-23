"use client";

import { useId, useRef, useState } from "react";

import {
  resolveSlideSource,
  SLIDER_BREAKPOINT_PX,
  SLIDER_PORTRAIT_MEDIA,
  type SliderConfig,
  type SliderSlide,
} from "@/lib/media/slider";

const SWIPE_THRESHOLD_PX = 40;

export type ResponsiveSliderViewProps = {
  config: SliderConfig;
  slides: readonly SliderSlide[];
  className?: string;
};

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
 * The interactive half of the shared responsive slider. It receives already
 * resolved slides from the server wrapper and renders native
 * `<picture>`/`<source media>` art direction: portrait below 768px, landscape
 * at or above it, with no cropping between ratios.
 */
export function ResponsiveSliderView({
  config,
  slides,
  className,
}: ResponsiveSliderViewProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const labelId = useId();
  const count = slides.length;

  function goTo(next: number) {
    setIndex(((next % count) + count) % count);
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
      className={className}
      role="group"
      aria-roledescription="carousel"
      aria-label={config.label}
    >
      <div className="relative overflow-hidden rounded-card border border-ink-200 bg-ink-100 shadow-card">
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {slides.map((slide, slideIndex) => (
            <figure
              key={slide.filename}
              className="w-full shrink-0"
              aria-hidden={slideIndex !== index}
              aria-label={`${slideIndex + 1} of ${count}`}
            >
              <picture>
                {slide.portrait && (
                  <source
                    media={SLIDER_PORTRAIT_MEDIA}
                    srcSet={slide.portrait}
                  />
                )}
                <img
                  src={resolveSlideSource(slide, SLIDER_BREAKPOINT_PX)}
                  alt={`${config.label} slide ${slideIndex + 1} of ${count}`}
                  className="block h-auto w-full"
                  loading={slideIndex === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
              </picture>
            </figure>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous slide"
              aria-controls={labelId}
              className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ink-950/10 bg-white/90 text-ink-900 shadow-pop backdrop-blur transition-colors hover:bg-white sm:left-4"
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next slide"
              aria-controls={labelId}
              className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-ink-950/10 bg-white/90 text-ink-900 shadow-pop backdrop-blur transition-colors hover:bg-white sm:right-4"
            >
              <Chevron direction="right" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div
          id={labelId}
          className="mt-5 flex items-center justify-center gap-2"
        >
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.filename}
              type="button"
              onClick={() => goTo(slideIndex)}
              aria-label={`Go to slide ${slideIndex + 1}`}
              aria-current={slideIndex === index ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                slideIndex === index
                  ? "w-6 bg-brand-600"
                  : "w-1.5 bg-ink-300 hover:bg-ink-700"
              }`}
            />
          ))}
        </div>
      )}

      {config.downloadUrl && (
        <div className="mt-6 flex justify-center">
          <a
            href={config.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Download {config.label}
          </a>
        </div>
      )}
    </div>
  );
}

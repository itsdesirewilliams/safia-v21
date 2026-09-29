"use client";

import { useEffect, useState } from "react";

import { ArrowIcon } from "@/components/ui/button";
import type { Certificate } from "@/lib/media/certification-assets";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/** How long each certificate stays on screen before the carousel advances. */
const CERTIFICATE_INTERVAL_MS = 6_000;

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
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
 * The homepage certificate carousel: one certificate is rendered visually at a
 * time using the browser's built-in PDF viewer (the supplied PDFs are shown
 * as-is, never rasterised or replaced). It advances automatically and loops
 * continuously, with manual previous/next controls, and each slide keeps a
 * direct link to the original PDF.
 */
export function CertificateCarousel({
  certificates,
}: {
  certificates: readonly Certificate[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const count = certificates.length;

  useEffect(() => {
    if (count <= 1 || reduceMotion || paused) {
      return;
    }
    const timer = setInterval(
      () => setIndex((value) => (value + 1) % count),
      CERTIFICATE_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [count, reduceMotion, paused]);

  if (count === 0) {
    return null;
  }

  const current = certificates[Math.min(index, count - 1)];

  function move(delta: number) {
    setIndex((value) => (value + delta + count) % count);
  }

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-500">Certificates</p>
        {count > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous certificate"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 transition-colors hover:border-ink-300 hover:bg-ink-50"
            >
              <Chevron direction="left" />
            </button>
            <span
              aria-live="polite"
              className="min-w-[3.5rem] text-center text-xs font-medium text-ink-500"
            >
              {index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next certificate"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 transition-colors hover:border-ink-300 hover:bg-ink-50"
            >
              <Chevron direction="right" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-ink-200 bg-ink-100">
        {/* A4 portrait, matching the supplied documents so nothing is cropped. */}
        <div className="mx-auto aspect-[1/1.414] w-full max-w-lg">
          <iframe
            key={current.url}
            src={`${current.url}#toolbar=0&navpanes=0&view=Fit`}
            title={`${current.name} (PDF)`}
            loading="lazy"
            className="h-full w-full animate-fade-in motion-reduce:animate-none"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span
          className="min-w-0 truncate text-sm font-semibold text-ink-950"
          title={current.name}
        >
          {current.name}
        </span>
        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
        >
          Open PDF
          <ArrowIcon className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

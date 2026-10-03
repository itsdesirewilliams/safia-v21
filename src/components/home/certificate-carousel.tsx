"use client";

import { useEffect, useState } from "react";

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
 * The homepage certificate slider. It shows one supplied certificate **image**
 * at a time (the rendered webp/jpg versions — the source PDFs are never
 * rendered, embedded or linked here). Each certificate keeps its natural
 * portrait aspect ratio (`block h-auto w-full`, never cropped or stretched),
 * scales to the available width on mobile, and sits at a comfortable readable
 * size on desktop. It advances automatically and loops continuously
 * (1 → 2 → 3 → 1), with previous/next controls and a smooth cross-fade that is
 * disabled under `prefers-reduced-motion`.
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

      <div className="mx-auto mt-3 w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <div className="overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
          {/*
            Natural aspect ratio: the image sets its own height, so the complete
            portrait certificate is always visible — never cropped or stretched.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.url}
            src={current.url}
            alt={current.name}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className="block h-auto w-full"
          />
        </div>

        <p
          className="mt-3 truncate text-center text-sm font-semibold text-ink-950"
          title={current.name}
        >
          {current.name}
        </p>
      </div>
    </div>
  );
}

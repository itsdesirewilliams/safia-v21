"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { wrapIndex } from "@/lib/gallery";
import type { GalleryImage } from "@/lib/media/gallery";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
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

export type GalleryViewerProps = {
  images: readonly GalleryImage[];
  initialIndex: number;
  onClose: () => void;
};

/**
 * Accessible fullscreen image viewer for the Gallery. Rendered in a portal so
 * it is never trapped by a transformed ancestor. Supports next/previous
 * (buttons, keyboard arrows and touch swipe), Escape and backdrop to close, a
 * simple focus trap, focus restoration, body scroll lock, and a subtle
 * lower-third caption overlay.
 */
export function GalleryViewer({
  images,
  initialIndex,
  onClose,
}: GalleryViewerProps) {
  const count = images.length;
  const [index, setIndex] = useState(() => wrapIndex(initialIndex, count));
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const image = images[index];

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((current) => wrapIndex(current + 1, count));
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((current) => wrapIndex(current - 1, count));
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose, count]);

  if (!image) {
    return null;
  }

  function step(delta: number) {
    setIndex((current) => wrapIndex(current + delta, count));
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

    step(delta < 0 ? 1 : -1);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Gallery image ${index + 1} of ${count}`}
        className="relative flex h-full max-h-[92svh] w-full max-w-5xl flex-col"
      >
        <div className="flex items-center justify-between gap-4 pb-4">
          <p className="text-sm font-medium tabular-nums text-white/70">
            {index + 1} / {count}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close viewer"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:border-white/40 hover:bg-white/10"
          >
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
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        <figure
          className="relative flex min-h-0 flex-1 items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={image.alt}
            draggable={false}
            className="max-h-full max-w-full rounded-2xl object-contain"
          />

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-ink-950/70 text-white backdrop-blur transition-colors hover:bg-ink-950 sm:left-4"
              >
                <Chevron direction="left" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-ink-950/70 text-white backdrop-blur transition-colors hover:bg-ink-950 sm:right-4"
              >
                <Chevron direction="right" />
              </button>
            </>
          )}

          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-ink-950/85 to-transparent px-6 pb-5 pt-14 text-sm font-medium text-white">
            {image.caption}
          </figcaption>
        </figure>
      </div>
    </div>,
    document.body,
  );
}

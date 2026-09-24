"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useModalDialog } from "@/components/media/use-modal-dialog";
import type { QualityFirstStory } from "@/lib/media/quality-first";

export type VideoViewerProps = {
  story: QualityFirstStory;
  label: string;
  onClose: () => void;
};

/**
 * Accessible video viewer for a single story. Rendered in a portal so it is
 * never trapped by a transformed ancestor. Supports native play/pause controls,
 * Escape to close, backdrop click, a simple focus trap, focus restoration and a
 * graceful fallback when the video cannot be played. It never autoplays with
 * sound.
 */
export function VideoViewer({ story, label, onClose }: VideoViewerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [failed, setFailed] = useState(false);

  useModalDialog({ dialogRef, initialFocusRef: closeRef, onClose });

  const titleId = `story-viewer-title-${story.path.replace(/[^a-z0-9]+/gi, "-")}`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/85 p-4 backdrop-blur-sm"
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
        aria-labelledby={titleId}
        className="relative flex max-h-[92svh] w-full max-w-4xl flex-col overflow-hidden rounded-card border border-white/10 bg-ink-950 shadow-pop"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <h2 id={titleId} className="text-sm font-semibold text-white">
            {label}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close video"
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

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
          {failed ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <p className="text-sm font-semibold text-white">
                This video could not be played.
              </p>
              <p className="max-w-md text-sm text-white/60">
                The file may be unavailable or in a format this browser cannot
                play. You can open it directly instead.
              </p>
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-white/90"
              >
                Open video
              </a>
            </div>
          ) : (
            <video
              className="max-h-[70svh] w-full bg-black"
              controls
              playsInline
              preload="metadata"
              poster={story.posterUrl ?? undefined}
              onError={() => setFailed(true)}
            >
              <source src={story.url} />
              Your browser does not support the video element.
            </video>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

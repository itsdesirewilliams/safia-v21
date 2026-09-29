"use client";

import type { QualityFirstStory } from "@/lib/media/quality-first";

export type StoryCardProps = {
  story: QualityFirstStory;
  label: string;
  onOpen: () => void;
};

/**
 * A single card in the testing-floor video strip. The card shows the video
 * itself, sized to its natural aspect ratio (`block h-auto w-full`) so portrait
 * and landscape footage both display without cropping or distortion. A play
 * affordance sits over it and selecting the card opens the accessible video
 * viewer.
 */
export function StoryCard({ story, label, onOpen }: StoryCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-40 flex-col text-left focus-visible:outline-none sm:w-48 lg:w-56"
      aria-label={`Play ${label}`}
    >
      <span className="relative block overflow-hidden rounded-lg border border-ink-200 bg-ink-950 shadow-card transition-transform duration-300 ease-out group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-brand-600 group-focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        {/* Natural aspect ratio: the video sets its own height, never cropped. */}
        <video
          src={story.url}
          poster={story.posterUrl ?? undefined}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none block h-auto w-full"
        />

        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-transparent"
        />

        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 inline-flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition-colors duration-300 group-hover:bg-accent-500 group-hover:border-accent-500"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5">
            <path d="M8 5.5v13l11-6.5-11-6.5Z" />
          </svg>
        </span>
      </span>

      <span className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-ink-900">
        {label}
      </span>
    </button>
  );
}

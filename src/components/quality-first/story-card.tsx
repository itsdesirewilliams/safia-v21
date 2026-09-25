"use client";

import Image from "next/image";
import { useState } from "react";

import type { QualityFirstStory } from "@/lib/media/quality-first";

export type StoryCardProps = {
  story: QualityFirstStory;
  label: string;
  onOpen: () => void;
};

/**
 * A single portrait story card. Shows the companion poster when one exists and
 * falls back to a branded placeholder when it is missing or fails to load.
 */
export function StoryCard({ story, label, onOpen }: StoryCardProps) {
  const [posterFailed, setPosterFailed] = useState(false);
  const showPoster = Boolean(story.posterUrl) && !posterFailed;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-40 flex-col text-left focus-visible:outline-none sm:w-48 lg:w-52"
      aria-label={`Play ${label}`}
    >
      <span className="relative block aspect-[9/16] overflow-hidden rounded-lg border border-ink-200 bg-ink-950 shadow-card transition-transform duration-300 ease-out group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-brand-600 group-focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        {showPoster ? (
          <Image
            src={story.posterUrl as string}
            alt=""
            fill
            sizes="(max-width: 640px) 10rem, 13rem"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
            onError={() => setPosterFailed(true)}
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 [background:radial-gradient(110%_90%_at_75%_0%,rgba(11,99,246,0.45),transparent_60%),radial-gradient(80%_80%_at_0%_110%,rgba(255,106,0,0.22),transparent_55%)]"
          />
        )}

        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-ink-950/20"
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

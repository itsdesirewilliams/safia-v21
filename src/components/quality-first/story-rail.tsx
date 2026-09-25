"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import type { QualityFirstStory } from "@/lib/media/quality-first";
import { QUALITY_FIRST_EMPTY_STATES } from "@/lib/quality-first";

import { StoryCard } from "./story-card";
import { VideoViewer } from "./video-viewer";

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

export type StoryRailProps = {
  stories: readonly QualityFirstStory[];
};

/**
 * The horizontal, story-style testing video rail. Native horizontal scrolling
 * (with touch/trackpad momentum) plus explicit previous/next controls for
 * non-touch use. Selecting a card opens the accessible video viewer.
 */
export function StoryRail({ stories }: StoryRailProps) {
  const railRef = useRef<HTMLUListElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const element = railRef.current;
    if (!element) {
      return;
    }
    setAtStart(element.scrollLeft <= 4);
    setAtEnd(
      element.scrollLeft + element.clientWidth >= element.scrollWidth - 4,
    );
  }, []);

  useEffect(() => {
    updateEdges();
  }, [stories.length, updateEdges]);

  function scrollRail(direction: -1 | 1) {
    const element = railRef.current;
    if (!element) {
      return;
    }
    const first = element.firstElementChild as HTMLElement | null;
    const step = (first?.clientWidth ?? 192) + 16;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    element.scrollBy({
      left: direction * step,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  if (stories.length === 0) {
    return (
      <PlaceholderPanel
        kind="video"
        label={QUALITY_FIRST_EMPTY_STATES.stories.label}
        detail={QUALITY_FIRST_EMPTY_STATES.stories.detail}
      />
    );
  }

  const activeStory = openIndex === null ? null : stories[openIndex];
  const activeLabel =
    openIndex === null
      ? ""
      : stories[openIndex].title ??
        stories[openIndex].caption ??
        `Testing story ${openIndex + 1}`;

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollRail(-1)}
          disabled={atStart}
          aria-label="Scroll stories left"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 shadow-soft transition-colors hover:border-ink-300 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Chevron direction="left" />
        </button>
        <button
          type="button"
          onClick={() => scrollRail(1)}
          disabled={atEnd}
          aria-label="Scroll stories right"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 shadow-soft transition-colors hover:border-ink-300 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Chevron direction="right" />
        </button>
      </div>

      <ul
        ref={railRef}
        onScroll={updateEdges}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {stories.map((story, index) => {
          const label =
            story.title ??
            story.caption ??
            `Testing story ${index + 1}`;

          return (
            <li key={story.path} className="shrink-0 snap-start">
              <Reveal delay={Math.min(index, 6) * 60}>
                <StoryCard
                  story={story}
                  label={label}
                  onOpen={() => setOpenIndex(index)}
                />
              </Reveal>
            </li>
          );
        })}
      </ul>

      {activeStory && (
        <VideoViewer
          story={activeStory}
          label={activeLabel}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}

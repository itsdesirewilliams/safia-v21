"use client";

import type { HeroSuggestion } from "@/lib/catalogue/suggestions";
import { cn } from "@/lib/cn";

/**
 * The "Popular searches" chips shown under a search field. Every suggestion is
 * a public concept (category, range, functional name or real tyre size) — never
 * a Pattern Code. Clicking a chip runs a search for its value; it never
 * navigates away, so the homepage stays inline.
 */
export function PopularSearches({
  suggestions,
  label,
  tone,
  onSelect,
}: {
  suggestions: readonly HeroSuggestion[];
  label: string;
  tone: "onDark" | "light";
  onSelect: (query: string) => void;
}) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <p
        className={cn(
          "text-[0.65rem] font-semibold uppercase tracking-[0.2em]",
          tone === "onDark" ? "text-white/40" : "text-ink-400",
        )}
      >
        {label}
      </p>
      <ul className="mt-2.5 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <li key={`${suggestion.kind}-${suggestion.query}`}>
            <button
              type="button"
              onClick={() => onSelect(suggestion.query)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                tone === "onDark"
                  ? "border border-white/15 bg-white/[0.06] text-white/75 hover:border-white/35 hover:bg-white/10 hover:text-white"
                  : "border border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:text-ink-950",
              )}
            >
              {suggestion.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

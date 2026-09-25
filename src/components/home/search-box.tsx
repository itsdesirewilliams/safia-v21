"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { MIN_SEARCH_LENGTH, type SearchResult } from "@/lib/catalogue/search";
import {
  HERO_SUGGESTION_ROTATE_MS,
  pickHeroSuggestions,
  type HeroSuggestion,
  type HeroSuggestionPool,
} from "@/lib/catalogue/suggestions";
import { ROUTES } from "@/lib/routes";

const DEBOUNCE_MS = 250;

function patternHref(result: SearchResult): string {
  return ROUTES.pattern(result.categorySlug, result.patternSlug);
}

function SuggestionChips({
  suggestions,
  rotation,
}: {
  suggestions: HeroSuggestion[];
  rotation: number;
}) {
  return (
    <div className="mt-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/40">
        Popular searches
      </p>
      <ul
        key={rotation}
        className="mt-2.5 flex flex-wrap gap-2 animate-fade-in motion-reduce:animate-none"
      >
        {suggestions.map((suggestion) => (
          <li key={`${suggestion.kind}-${suggestion.href}`}>
            <Link
              href={suggestion.href}
              className="inline-flex min-h-11 items-center rounded-lg border border-white/15 bg-white/[0.06] px-3.5 py-2 text-sm font-medium text-white/75 transition-colors hover:border-white/35 hover:bg-white/10 hover:text-white"
            >
              {suggestion.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SearchBox({
  suggestions = { category: [], size: [], name: [] },
}: {
  suggestions?: HeroSuggestionPool;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const inputId = useId();

  const heroSuggestions = useMemo(
    () => pickHeroSuggestions(suggestions, rotation),
    [suggestions, rotation],
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const interval = setInterval(
      () => setRotation((current) => current + 1),
      HERO_SUGGESTION_ROTATE_MS,
    );
    return () => clearInterval(interval);
  }, []);

  function onQueryChange(value: string) {
    setQuery(value);
    if (value.trim().length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      setActiveIndex(-1);
    }
  }

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_SEARCH_LENGTH) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }
        const data = (await response.json()) as { results?: SearchResult[] };
        setResults(Array.isArray(data.results) ? data.results : []);
        setOpen(true);
        setActiveIndex(-1);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || results.length === 0) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (index) => (index - 1 + results.length) % results.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex >= 0 ? activeIndex : 0];
      setOpen(false);
      router.push(patternHref(target));
    }
  }

  const trimmedQuery = query.trim();
  const showEmpty = open && !loading && results.length === 0 && trimmedQuery.length >= MIN_SEARCH_LENGTH;
  const showSuggestions = trimmedQuery.length === 0 && heroSuggestions.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={inputId} className="sr-only">
        Search tyres by size, pattern code, name or category
      </label>
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m20 20-3.5-3.5" />
        </svg>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search by size, pattern code, name or category…"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
          }
          autoComplete="off"
          className="w-full rounded-lg border border-transparent bg-white py-4 pl-14 pr-5 text-base font-medium text-ink-900 shadow-pop outline-none transition placeholder:font-normal placeholder:text-ink-400 focus:ring-4 focus:ring-brand-500/30"
        />
      </div>

      {showSuggestions && (
        <SuggestionChips
          suggestions={heroSuggestions}
          rotation={rotation}
        />
      )}

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Product search results"
          className="absolute z-30 mt-3 max-h-96 w-full overflow-auto rounded-lg border border-ink-200 bg-white py-2 text-left shadow-pop"
        >
          {loading ? (
            <li className="px-5 py-3 text-sm text-ink-600">Searching…</li>
          ) : showEmpty ? (
            <li className="px-5 py-3 text-sm text-ink-600">
              No matching patterns found. Try a size such as{" "}
              <span className="font-medium text-ink-900">6.00-16</span> or a
              code such as{" "}
              <span className="font-medium text-ink-900">TR-1042</span>.
            </li>
          ) : (
            results.map((result, index) => (
              <li
                key={result.patternSlug}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <Link
                  href={patternHref(result)}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-start justify-between gap-4 px-5 py-3 transition-colors ${
                    index === activeIndex ? "bg-ink-50" : "hover:bg-ink-50"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink-950">
                      {result.displayName}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-600">
                      {result.categoryDisplayName}
                      {result.sizes.length > 0 &&
                        ` · ${result.sizes.slice(0, 3).join(", ")}${
                          result.sizes.length > 3 ? "…" : ""
                        }`}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-lg bg-ink-950 px-2 py-1 text-[11px] font-semibold tracking-wide text-white">
                    {result.patternCode}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { PopularSearches } from "@/components/search/popular-searches";
import { SearchInput } from "@/components/search/search-input";
import { SearchResultRow } from "@/components/search/search-result-row";
import { searchResultHref } from "@/lib/catalogue/search-result";
import { MIN_SEARCH_LENGTH } from "@/lib/search/limits";
import {
  HERO_PLACEHOLDER_ROTATE_MS,
  HERO_SUGGESTION_ROTATE_MS,
  pickHeroSuggestions,
  type HeroSuggestionPool,
} from "@/lib/catalogue/suggestions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/url";
import { useProductSearch } from "@/lib/search/use-product-search";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function SearchBox({
  suggestions = { category: [], size: [], name: [] },
  placeholderPhrases = [],
  labels,
  locale,
}: {
  suggestions?: HeroSuggestionPool;
  placeholderPhrases?: readonly string[];
  labels: Dictionary["search"];
  locale?: Locale;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rotation, setRotation] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const { results, loading } = useProductSearch(query);
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const heroSuggestions = useMemo(
    () => pickHeroSuggestions(suggestions, rotation),
    [suggestions, rotation],
  );

  // Popular searches rotate every ~10s.
  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const interval = setInterval(
      () => setRotation((current) => current + 1),
      HERO_SUGGESTION_ROTATE_MS,
    );
    return () => clearInterval(interval);
  }, [reduceMotion]);

  // The placeholder rotates every ~5s, but never while the visitor is typing.
  useEffect(() => {
    if (reduceMotion || query.trim().length > 0 || placeholderPhrases.length <= 1) {
      return;
    }
    const interval = setInterval(
      () => setPlaceholderIndex((index) => index + 1),
      HERO_PLACEHOLDER_ROTATE_MS,
    );
    return () => clearInterval(interval);
  }, [reduceMotion, query, placeholderPhrases.length]);

  const placeholder =
    placeholderPhrases.length > 0
      ? `${labels.trySearching} ${
          placeholderPhrases[placeholderIndex % placeholderPhrases.length]
        }...`
      : labels.trySearching;

  function onQueryChange(value: string) {
    setQuery(value);
    if (value.trim().length < MIN_SEARCH_LENGTH) {
      setOpen(false);
      setActiveIndex(-1);
    } else {
      setOpen(true);
    }
  }

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
      router.push(localizedHref(locale ?? "en", searchResultHref(target)));
    }
  }

  const trimmedQuery = query.trim();
  const showEmpty =
    open && !loading && results.length === 0 && trimmedQuery.length >= MIN_SEARCH_LENGTH;
  const showSuggestions = trimmedQuery.length === 0 && heroSuggestions.length > 0;
  const showPlaceholder = trimmedQuery.length === 0;

  return (
    <div ref={containerRef} className="relative">
      <SearchInput
        value={query}
        onChange={onQueryChange}
        onKeyDown={onKeyDown}
        onFocus={() => results.length > 0 && setOpen(true)}
        ariaLabel={labels.inputLabel}
        listId={listId}
        open={open}
        activeDescendant={
          activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
        }
        className="border-transparent shadow-pop"
        overlay={
          showPlaceholder ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-14 right-5 top-1/2 -translate-y-1/2 truncate text-base font-normal text-ink-400"
            >
              {placeholder}
            </span>
          ) : undefined
        }
      />

      {showSuggestions && (
        <PopularSearches
          suggestions={heroSuggestions}
          label={labels.suggestions}
          tone="onDark"
          onSelect={(value) => {
            setQuery(value);
            setOpen(true);
          }}
        />
      )}

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={labels.resultsLabel}
          className="absolute z-30 mt-3 max-h-96 w-full overflow-auto rounded-lg border border-ink-200 bg-white py-2 text-left shadow-pop"
        >
          {loading ? (
            <li className="px-5 py-3 text-sm text-ink-600">{labels.searching}</li>
          ) : showEmpty ? (
            <li className="px-5 py-3 text-sm text-ink-600">
              {labels.noResults}
            </li>
          ) : (
            results.map((result, index) => (
              <li
                key={searchResultHref(result)}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <SearchResultRow
                  result={result}
                  locale={locale}
                  active={index === activeIndex}
                  onSelect={() => setOpen(false)}
                  onActivate={() => setActiveIndex(index)}
                />
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { PopularSearches } from "@/components/search/popular-searches";
import { SearchInput } from "@/components/search/search-input";
import { SearchResultRow } from "@/components/search/search-result-row";
import {
  searchResultHref,
  type SearchResult,
} from "@/lib/catalogue/search-result";
import {
  HERO_PLACEHOLDER_ROTATE_MS,
  HERO_SUGGESTION_ROTATE_MS,
  pickHeroSuggestions,
  type HeroSuggestionPool,
} from "@/lib/catalogue/suggestions";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { localizedHref } from "@/lib/i18n/url";
import { MIN_SEARCH_LENGTH } from "@/lib/search/limits";
import { useProductSearch } from "@/lib/search/use-product-search";

/**
 * The dedicated `/search` experience.
 *
 * It reuses the shared search field, result row, popular-search chips and the
 * `useProductSearch` hook, so the homepage hero, the header trigger and this
 * page all run the same search logic. Results are server-rendered for the
 * initial `?q=` (shareable and refresh-safe) and refreshed live as the visitor
 * types; the URL is kept in sync so the query stays shareable.
 *
 * The placeholder rotates every ~5s and the popular-search group every ~10s;
 * both use only public concepts (sizes, ranges, functional names, categories).
 */
export function SearchExperience({
  initialQuery,
  initialResults,
  labels,
  suggestions,
  placeholderPhrases,
  locale,
}: {
  initialQuery: string;
  initialResults: SearchResult[];
  labels: Dictionary["search"];
  suggestions: HeroSuggestionPool;
  placeholderPhrases: readonly string[];
  locale: Locale;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const { results: liveResults, loading } = useProductSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Rotate the placeholder every ~5s, but never while the visitor is typing.
  useEffect(() => {
    if (query.trim().length > 0 || placeholderPhrases.length <= 1) {
      return;
    }
    const timer = setInterval(
      () => setPlaceholderIndex((index) => index + 1),
      HERO_PLACEHOLDER_ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, [query, placeholderPhrases.length]);

  // Rotate the popular-search group every ~10s.
  useEffect(() => {
    const timer = setInterval(
      () => setRotation((index) => index + 1),
      HERO_SUGGESTION_ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, []);

  // Keep `?q=` in the address bar without a server round-trip per keystroke.
  useEffect(() => {
    const trimmed = query.trim();
    const timer = setTimeout(() => {
      const path = window.location.pathname;
      const next =
        trimmed.length >= MIN_SEARCH_LENGTH
          ? `${path}?q=${encodeURIComponent(trimmed)}`
          : path;
      window.history.replaceState(null, "", next);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const popular = useMemo(
    () => pickHeroSuggestions(suggestions, rotation),
    [suggestions, rotation],
  );

  const trimmed = query.trim();
  const isSearching = trimmed.length >= MIN_SEARCH_LENGTH;
  // Until the visitor edits the query, show the server-rendered results (which
  // also means the initial `?q=` paint is correct before hydration).
  const usingInitial = trimmed === initialQuery.trim();
  const results = usingInitial
    ? initialResults
    : isSearching
      ? liveResults
      : [];
  const isLoading = usingInitial ? false : loading;
  const showEmpty = isSearching && !isLoading && results.length === 0;

  const placeholder =
    placeholderPhrases.length > 0
      ? `${labels.trySearching} ${
          placeholderPhrases[placeholderIndex % placeholderPhrases.length]
        }...`
      : labels.placeholder;

  function runSearch(value: string) {
    setQuery(value);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isSearching || results.length === 0) {
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
      router.push(localizedHref(locale, searchResultHref(target)));
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <SearchInput
        value={query}
        onChange={(value) => {
          setQuery(value);
          setActiveIndex(-1);
        }}
        onKeyDown={onKeyDown}
        ariaLabel={labels.inputLabel}
        placeholder={placeholder}
        autoFocus
        inputRef={inputRef}
        listId="search-results"
        open={isSearching}
        activeDescendant={
          activeIndex >= 0 ? `search-results-${activeIndex}` : undefined
        }
        className="border-ink-200 shadow-card"
      />

      {!isSearching && (
        <PopularSearches
          suggestions={popular}
          label={labels.suggestions}
          tone="light"
          onSelect={runSearch}
        />
      )}

      {isSearching && (
        <section className="mt-8" aria-label={labels.resultsLabel}>
          <h2 className="text-lg font-semibold text-ink-950">
            {labels.results}
          </h2>

          {isLoading ? (
            <p className="mt-4 text-sm text-ink-600">{labels.searching}</p>
          ) : showEmpty ? (
            <p className="mt-4 text-sm text-ink-600">{labels.noResults}</p>
          ) : (
            <ul
              id="search-results"
              className="mt-4 divide-y divide-ink-100 overflow-hidden rounded-lg border border-ink-200 bg-white shadow-soft"
            >
              {results.map((result, index) => (
                <li
                  key={searchResultHref(result)}
                  id={`search-results-${index}`}
                >
                  <SearchResultRow
                    result={result}
                    locale={locale}
                    active={index === activeIndex}
                    onActivate={() => setActiveIndex(index)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

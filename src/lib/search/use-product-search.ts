"use client";

import { useEffect, useState } from "react";

import type { SearchResult } from "@/lib/catalogue/search-result";
import { MIN_SEARCH_LENGTH } from "@/lib/search/limits";

const DEFAULT_DEBOUNCE_MS = 250;

export type ProductSearchState = {
  results: SearchResult[];
  loading: boolean;
};

/**
 * The single client-side search data path, shared by the homepage hero, the
 * dedicated `/search` page and (via the header link) the header trigger.
 *
 * It debounces the input, calls the one server endpoint (`/api/search`, which
 * runs the normalization pipeline and merges category + radial results) and
 * returns the hits. Presentation stays with the callers; this hook owns only
 * the search *logic* so it is never duplicated.
 */
export function useProductSearch(
  query: string,
  debounceMs: number = DEFAULT_DEBOUNCE_MS,
): ProductSearchState {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const trimmed = query.trim();
  const active = trimmed.length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
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
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [trimmed, debounceMs]);

  // Derive the "not searching yet" state so the effect never sets state
  // synchronously (which would cause a cascading render).
  return active ? { results, loading } : { results: [], loading: false };
}

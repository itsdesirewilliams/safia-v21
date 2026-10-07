import { isCategorySlug } from "@/lib/catalogue/categories";
import {
  MAX_SEARCH_LENGTH,
  MIN_SEARCH_LENGTH,
  normalizeSearchQuery,
  sanitizeQuery,
} from "@/lib/search/normalize";

import { searchRanges } from "./range-search";
import {
  toPublicResult,
  type SearchResult,
  searchResultHref,
} from "./search-result";

/**
 * Server-side product search, fronted by the customer-query normalization
 * pipeline and the canonical tyre-size normalizer.
 *
 * The pipeline turns messy input into canonical terms — a confirmed tyre size,
 * a category slug, or the cleaned query — and this module matches those terms
 * against a Variant `size`, a Pattern `displayName` or a Category. Every hit
 * resolves to a **Pattern** (never a Variant) and links to the Pattern detail
 * page. The matching itself still runs in Postgres (ILIKE) via the
 * `search_patterns` RPC; this module normalizes the query, tries the canonical
 * terms in priority order and maps rows — the seam the tests exercise.
 *
 * Pattern Codes are internal identifiers and are NOT a public search concept.
 * The RPC still scans the code column, so a row that matched *only* on its code
 * is dropped here; a customer can never surface a product by typing a code.
 */

export { MAX_SEARCH_LENGTH, MIN_SEARCH_LENGTH, sanitizeQuery };
export type { SearchMatchState } from "@/lib/search/normalize";
export { searchResultHref, toPublicResult };
export type { SearchResult };

/** The narrow slice of the Supabase client the search needs. */
export interface SearchClient {
  rpc(
    fn: string,
    args: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { message: string } | null }>;
}

const MAX_RESULTS = 10;

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asSizes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((size): size is string => typeof size === "string");
}

function mapRows(data: unknown): SearchResult[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const results: SearchResult[] = [];
  for (const row of data) {
    if (typeof row !== "object" || row === null) {
      continue;
    }
    const record = row as Record<string, unknown>;
    const categorySlug = asString(record.category_slug);
    const patternSlug = asString(record.pattern_slug);
    const patternCode = asString(record.pattern_code);
    const displayName = asString(record.display_name);
    const categoryDisplayName = asString(record.category_display_name);

    if (
      !categorySlug ||
      !isCategorySlug(categorySlug) ||
      !patternSlug ||
      !patternCode ||
      !displayName ||
      !categoryDisplayName
    ) {
      continue;
    }

    results.push({
      categorySlug,
      categoryDisplayName,
      patternSlug,
      patternCode,
      displayName,
      sizes: asSizes(record.sizes),
    });
  }

  return results;
}

/**
 * Whether a result matched *only* through a partial Pattern Code. Pattern Codes
 * are internal identifiers and not a public search concept, so a partial code
 * ("fm" hitting "SFM-101") is dropped: a hit must also match the public name or
 * category. An exact full code still resolves to its Pattern (internal route
 * resolution), which is how a variant is looked up behind the scenes.
 */
function isCodeOnlyMatch(result: SearchResult, query: string): boolean {
  const cleaned = query.trim().toLowerCase();
  if (cleaned.length === 0) {
    return false;
  }
  const code = result.patternCode?.toLowerCase();
  if (!code) {
    return false;
  }
  if (cleaned === code) {
    return false;
  }
  if (!code.includes(cleaned)) {
    return false;
  }
  const name = result.displayName.toLowerCase();
  const category = result.categoryDisplayName.toLowerCase();
  return !name.includes(cleaned) && !category.includes(cleaned);
}

/** Query one term group, de-duplicating Patterns across its terms. */
async function queryTerms(
  client: SearchClient,
  terms: readonly string[],
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const seen = new Set<string>();

  for (const term of terms) {
    const { data, error } = await client.rpc("search_patterns", {
      search: term,
    });
    if (error) {
      continue;
    }
    for (const result of mapRows(data)) {
      if (seen.has(result.patternSlug)) {
        continue;
      }
      seen.add(result.patternSlug);
      results.push(result);
    }
  }

  return results;
}

/**
 * Resolve a free-text customer query to Patterns.
 *
 * Confirmed sizes are tried first, then inferred categories, then the cleaned
 * query — so "tuk tuk 750 16" searches for `7.50-16` and ranks Three Wheeler
 * results first. An input whose size-shaped numbers do not exist in the
 * catalogue returns no results: the pipeline never fabricates a match.
 */
export async function searchPatterns(
  client: SearchClient,
  query: string,
): Promise<SearchResult[]> {
  const normalized = normalizeSearchQuery(query);
  // The radial ranges (TBR/PCR) are searched locally, independent of the DB.
  const rangeResults = searchRanges(query);

  if (normalized.matchState === "INVALID") {
    return rangeResults.slice(0, MAX_RESULTS);
  }

  const groups: string[][] = [];
  if (normalized.sizeCandidates.length > 0) {
    groups.push([...normalized.sizeCandidates]);
  }
  if (normalized.categoryCandidates.length > 0) {
    groups.push([...normalized.categoryCandidates]);
  }
  if (normalized.normalizedQuery.length >= MIN_SEARCH_LENGTH) {
    groups.push([normalized.normalizedQuery]);
  }

  let results: SearchResult[] = [];
  for (const group of groups) {
    results = await queryTerms(client, group);
    if (results.length > 0) {
      break;
    }
  }

  // Prefer results in an inferred category, preserving the dataset order
  // otherwise (stable sort).
  if (normalized.categoryCandidates.length > 0) {
    const rank = new Map(
      normalized.categoryCandidates.map((slug, index) => [slug, index]),
    );
    results = results
      .map((result, index) => ({ result, index }))
      .sort((a, b) => {
        const rankA = rank.get(a.result.categorySlug) ?? Number.MAX_SAFE_INTEGER;
        const rankB = rank.get(b.result.categorySlug) ?? Number.MAX_SAFE_INTEGER;
        return rankA - rankB || a.index - b.index;
      })
      .map((entry) => entry.result);
  }

  // Pattern Codes are internal: drop any row that matched only its code.
  results = results.filter(
    (result) => !isCodeOnlyMatch(result, normalized.normalizedQuery),
  );

  // Category results first (they honour the category ranking), then the radial
  // range matches. De-duplicate by destination so a Pattern is never repeated.
  const seen = new Set<string>();
  const merged: SearchResult[] = [];
  for (const result of [...results, ...rangeResults]) {
    const key = searchResultHref(result);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    merged.push(result);
  }

  return merged.slice(0, MAX_RESULTS);
}

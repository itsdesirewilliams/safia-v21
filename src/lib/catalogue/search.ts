import { isCategorySlug, type CategorySlug } from "@/lib/catalogue/categories";
import {
  MAX_SEARCH_LENGTH,
  MIN_SEARCH_LENGTH,
  normalizeSearchQuery,
  sanitizeQuery,
} from "@/lib/search/normalize";

/**
 * Server-side product search (spec #8), now fronted by the customer-query
 * normalization pipeline (Phase 1).
 *
 * The pipeline turns messy input into canonical terms — a confirmed tyre size,
 * a category slug, or the cleaned query — and this module matches those terms
 * against a Variant `size`, a Pattern `patternCode`, a Pattern `displayName` or
 * a Category. Every hit resolves to a **Pattern** (never a Variant) and links to
 * the Pattern detail page. The matching itself still runs in Postgres (ILIKE)
 * via the `search_patterns` RPC; this module normalizes the query, tries the
 * canonical terms in priority order and maps rows — the seam the tests exercise.
 */

export { MAX_SEARCH_LENGTH, MIN_SEARCH_LENGTH, sanitizeQuery };
export type { SearchMatchState } from "@/lib/search/normalize";

export type SearchResult = {
  categorySlug: CategorySlug;
  categoryDisplayName: string;
  patternSlug: string;
  patternCode: string;
  displayName: string;
  sizes: string[];
};

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

  if (normalized.matchState === "INVALID") {
    return [];
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

  return results.slice(0, MAX_RESULTS);
}

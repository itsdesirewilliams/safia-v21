import { isCategorySlug, type CategorySlug } from "@/lib/catalogue/categories";

/**
 * Server-side product search (spec #8).
 *
 * A query matches a Variant `size`, a Pattern `patternCode`, a Pattern
 * `displayName`, or a Category name/slug. Every hit resolves to a **Pattern**
 * — never a Variant — and links to the Pattern detail page. The matching runs
 * in Postgres (ILIKE) via the `search_patterns` RPC; this module only
 * normalises the query and maps rows, which is the seam the tests exercise.
 */

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

export const MIN_SEARCH_LENGTH = 2;
export const MAX_SEARCH_LENGTH = 64;

/** Trim, collapse whitespace and cap the length of a raw query. */
export function normalizeSearchQuery(raw: string | null | undefined): string {
  if (!raw) {
    return "";
  }
  return raw.trim().replace(/\s+/g, " ").slice(0, MAX_SEARCH_LENGTH);
}

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
 * Resolve a free-text query to Patterns. Returns an empty list (never throws)
 * for short queries, empty results or a transport error, so the live dropdown
 * degrades gracefully.
 */
export async function searchPatterns(
  client: SearchClient,
  query: string,
): Promise<SearchResult[]> {
  const normalized = normalizeSearchQuery(query);
  if (normalized.length < MIN_SEARCH_LENGTH) {
    return [];
  }

  const { data, error } = await client.rpc("search_patterns", {
    search: normalized,
  });

  if (error) {
    return [];
  }

  return mapRows(data);
}

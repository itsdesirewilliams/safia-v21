import type { CategorySlug } from "./categories";

import { ROUTES } from "@/lib/routes";

/**
 * A single search hit. Every hit resolves to a **Pattern** (never a Variant) and
 * links to that Pattern's page. Results come from two sources that share this
 * shape:
 *
 *  - the Postgres `search_patterns` RPC (the seven canonical categories), and
 *  - the bundled radial ranges (TBR/PCR) searched locally from their JSON data.
 *
 * `href` is an explicit destination override used by the radial ranges, whose
 * Pattern pages live under `/products/truck-bus-tire/...` rather than the
 * category Pattern route.
 */
export type SearchResult = {
  categorySlug: CategorySlug;
  categoryDisplayName: string;
  patternSlug: string;
  /**
   * Internal Pattern Code. Present only server-side (used to drop partial-code
   * matches); it is stripped before a result is sent to the client and is never
   * rendered.
   */
  patternCode?: string;
  displayName: string;
  sizes: string[];
  /** Explicit destination; falls back to the category Pattern route. */
  href?: string;
  /** Range badge for radial results, e.g. "TBR" / "PCR". */
  range?: string;
};

/** The Pattern destination a result should link to. */
export function searchResultHref(result: SearchResult): string {
  return result.href ?? ROUTES.pattern(result.categorySlug, result.patternSlug);
}

/**
 * The public projection sent to the browser: identical to a `SearchResult` but
 * with the internal Pattern Code removed, so a code can never reach the client.
 */
export function toPublicResult(result: SearchResult): SearchResult {
  return {
    categorySlug: result.categorySlug,
    categoryDisplayName: result.categoryDisplayName,
    patternSlug: result.patternSlug,
    displayName: result.displayName,
    sizes: result.sizes,
    ...(result.href ? { href: result.href } : {}),
    ...(result.range ? { range: result.range } : {}),
  };
}

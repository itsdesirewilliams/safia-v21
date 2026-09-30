import type { CategorySlug } from "@/lib/catalogue/categories";
import { catalogueSizeDictionary } from "@/lib/catalogue/dataset";

import { matchCategoryAliases } from "./aliases";
import { extractSizeCandidates, type SizeDictionary } from "./size";

/**
 * Customer search-query normalization (Phase 1).
 *
 * A deterministic pipeline that runs *before* the existing product search:
 *
 *   raw query → text cleaning → alias/synonym normalization →
 *   tyre-size normalization → tokenization → canonical search terms
 *
 * It never matches products itself and never invents a size. It emits
 * *candidates* (category hints and confirmed canonical sizes) plus the terms the
 * search should try, in priority order. The catalogue remains the authority:
 * a size is only ever emitted because the real dataset contains it.
 *
 * The shapes here are intentionally extensible (Phase 2): add aliases in
 * `aliases.ts`, size rules in `size.ts`, and stop-words/cleaning rules here,
 * without touching the search engine.
 */

export const MIN_SEARCH_LENGTH = 2;
export const MAX_SEARCH_LENGTH = 64;

/** Match score states, from strongest to weakest. */
export type SearchMatchState =
  | "EXACT"
  | "NORMALIZED"
  | "ALIAS_MATCH"
  | "FUZZY_MATCH"
  | "NO_MATCH"
  | "INVALID";

export type NormalizedSearchQuery = {
  /** The customer's input, untouched. */
  rawQuery: string;
  /** The cleaned query (lower-cased, punctuation/whitespace normalized). */
  normalizedQuery: string;
  /** Category slugs implied by aliases, in confidence order. */
  categoryCandidates: CategorySlug[];
  /** Canonical sizes confirmed against the dataset, in priority order. */
  sizeCandidates: string[];
  /** Meaningful tokens left after aliases and stop-words are removed. */
  tokens: string[];
  /** Canonical terms to feed the existing search, strongest first. */
  matchTerms: string[];
  /** A coarse 0–1 confidence for the interpretation. */
  confidence: number;
  matchState: SearchMatchState;
  /** Whether cleaning/alias/size rules actually changed anything. */
  normalizationApplied: boolean;
};

/**
 * Filler words that carry no product meaning. Kept deliberately small: removing
 * a word a customer meant as a search term is worse than keeping a filler.
 */
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "for",
  "with",
  "to",
  "in",
  "on",
  "at",
  "is",
  "are",
  "am",
  "be",
  "i",
  "we",
  "you",
  "my",
  "our",
  "your",
  "me",
  "us",
  "need",
  "needed",
  "want",
  "wanted",
  "looking",
  "look",
  "please",
  "pls",
  "plz",
  "kindly",
  "any",
  "some",
  "help",
  "quote",
  "quotation",
  "price",
  "prices",
  "rate",
  "rates",
  "buy",
  "purchase",
  "hello",
  "hi",
  "dear",
  "sir",
  "madam",
  "thanks",
  "thank",
]);

const DASHES = /[\u2010-\u2015\u2212]/g;
const PUNCTUATION = /[,\u2022\u00b7|;:]/g;
const LINE_BREAKS = /[\r\n\t]+/g;
const UNSUPPORTED = /[^a-z0-9.\-/x\s]/g;

/**
 * Text cleaning: lower-case, normalize dashes, turn commas/slashes-like
 * separators and line breaks into spaces, drop other punctuation, collapse
 * whitespace and cap the length. Decimal points, hyphens and slashes are
 * preserved because tyre sizes depend on them.
 */
export function cleanSearchText(raw: string | null | undefined): string {
  if (!raw) {
    return "";
  }

  return raw
    .toLowerCase()
    .replace(DASHES, "-")
    .replace(PUNCTUATION, " ")
    .replace(LINE_BREAKS, " ")
    .replace(UNSUPPORTED, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);
}

/** A short, lower-cased, whitespace-collapsed query for the API guard. */
export function sanitizeQuery(raw: string | null | undefined): string {
  return cleanSearchText(raw);
}

function confidenceFor(state: SearchMatchState): number {
  switch (state) {
    case "EXACT":
      return 1;
    case "NORMALIZED":
      return 0.9;
    case "ALIAS_MATCH":
      return 0.6;
    case "FUZZY_MATCH":
      return 0.4;
    default:
      return 0;
  }
}

/**
 * Run the full normalization pipeline over a raw customer query.
 *
 * `sizes` defaults to the real catalogue dictionary; pass a custom one in tests
 * or to confirm against a different dataset.
 */
export function normalizeSearchQuery(
  raw: string | null | undefined,
  sizes: SizeDictionary = catalogueSizeDictionary(),
): NormalizedSearchQuery {
  const rawQuery = raw ?? "";
  const normalizedQuery = cleanSearchText(rawQuery);

  const { categories: categoryCandidates, residual } =
    matchCategoryAliases(normalizedQuery);
  const { candidates: sizeCandidates, hadSizeLikeInput } =
    extractSizeCandidates(residual, sizes);

  const tokens = residual
    .split(" ")
    .filter((token) => token.length > 0 && !STOPWORDS.has(token));

  const lowerSizes = sizeCandidates.map((size) => size.toLowerCase());
  const exactSize =
    sizeCandidates.length > 0 &&
    lowerSizes.some((size) => normalizedQuery.includes(size));

  let matchState: SearchMatchState;
  if (sizeCandidates.length > 0) {
    matchState = exactSize ? "EXACT" : "NORMALIZED";
  } else if (categoryCandidates.length > 0) {
    matchState = "ALIAS_MATCH";
  } else if (hadSizeLikeInput) {
    matchState = "INVALID";
  } else if (tokens.length > 0) {
    matchState = "FUZZY_MATCH";
  } else {
    matchState = "NO_MATCH";
  }

  const matchTerms: string[] = [];
  if (matchState !== "INVALID" && matchState !== "NO_MATCH") {
    if (sizeCandidates.length > 0) {
      matchTerms.push(...sizeCandidates);
    } else if (categoryCandidates.length > 0) {
      matchTerms.push(...categoryCandidates);
    } else if (normalizedQuery.length >= MIN_SEARCH_LENGTH) {
      matchTerms.push(normalizedQuery);
    }
  }

  const normalizationApplied =
    normalizedQuery !== rawQuery.trim().toLowerCase() ||
    categoryCandidates.length > 0 ||
    (sizeCandidates.length > 0 && !exactSize);

  return {
    rawQuery,
    normalizedQuery,
    categoryCandidates,
    sizeCandidates,
    tokens,
    matchTerms,
    confidence: confidenceFor(matchState),
    matchState,
    normalizationApplied,
  };
}

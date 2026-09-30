import type { CategorySlug } from "@/lib/catalogue/categories";

/**
 * Centralized category alias dictionary for search normalization (Phase 1).
 *
 * Each phrase is written in a normalized, lower-case form. Matching treats any
 * run of spaces and/or hyphens between the phrase's words as equivalent, so
 * "three wheeler", "three-wheeler" and "threewheeler" all resolve to the same
 * alias. This dictionary is the single place to teach the search new customer
 * phrasings (slang, brand names, country-specific habits): never scatter alias
 * rules through components, and never edit the product dataset to add one.
 *
 * Adding an alias only ever produces a *candidate* category hint. It never
 * returns a product on its own — the actual catalogue is always the authority
 * (see `normalize.ts`).
 */
export type CategoryAlias = {
  categorySlug: CategorySlug;
  phrases: readonly string[];
};

/**
 * Phase 1 alias set. Kept deliberately broad for the categories customers
 * actually describe loosely. Extend this list (Phase 2) with observed customer
 * phrasings; no search-engine change is required to add one.
 */
export const CATEGORY_ALIASES: readonly CategoryAlias[] = [
  {
    categorySlug: "three-wheeler",
    phrases: [
      "three wheeler",
      "3 wheeler",
      "tuk tuk",
      "tuktuk",
      "auto rickshaw",
      "autorickshaw",
      "auto",
      "bajaj",
      "rickshaw",
    ],
  },
  {
    categorySlug: "truck-bus",
    phrases: [
      "truck",
      "lorry",
      "bus",
      "commercial vehicle",
      "commercial",
      "cv",
    ],
  },
  {
    categorySlug: "agriculture",
    phrases: [
      "agriculture",
      "agricultural",
      "tractor",
      "farm",
      "farming",
      "implement",
      "harrow",
    ],
  },
  {
    categorySlug: "forklift",
    phrases: ["forklift", "fork lift"],
  },
  {
    categorySlug: "otr",
    phrases: [
      "otr",
      "off the road",
      "off road",
      "earthmover",
      "earth mover",
      "grader",
      "loader",
    ],
  },
  {
    categorySlug: "motorcycle",
    phrases: [
      "motorcycle",
      "motorbike",
      "bike",
      "two wheeler",
      "2 wheeler",
      "scooter",
    ],
  },
];

const REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;

/** Build a matcher for an alias phrase, tolerating spaces/hyphens between words. */
function aliasMatcher(phrase: string): RegExp {
  const body = phrase
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(REGEX_SPECIAL, "\\$&"))
    .join("[\\s-]*");
  return new RegExp(`\\b${body}\\b`, "g");
}

export type CategoryAliasMatch = {
  /** Canonical category slugs implied by the query, in dictionary order. */
  categories: CategorySlug[];
  /** The query text with matched alias phrases removed, for size extraction. */
  residual: string;
};

/**
 * Match every known alias in the text and strip the matched spans out. Removing
 * them matters because some aliases carry digits ("3 wheeler") that must not be
 * mistaken for a tyre-size component later in the pipeline.
 */
export function matchCategoryAliases(text: string): CategoryAliasMatch {
  let residual = text;
  const categories: CategorySlug[] = [];

  for (const alias of CATEGORY_ALIASES) {
    let matched = false;
    for (const phrase of alias.phrases) {
      const next = residual.replace(aliasMatcher(phrase), " ");
      if (next !== residual) {
        matched = true;
        residual = next;
      }
    }
    if (matched && !categories.includes(alias.categorySlug)) {
      categories.push(alias.categorySlug);
    }
  }

  return { categories, residual: residual.replace(/\s+/g, " ").trim() };
}

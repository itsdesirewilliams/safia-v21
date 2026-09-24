import {
  CATEGORIES,
  getCategory,
  type CategorySlug,
} from "@/lib/catalogue/categories";
import { CATALOGUE, patternSizes } from "@/lib/catalogue/dataset";
import {
  CATALOGUE_STATS,
  PATTERNS_BY_CATEGORY,
} from "@/lib/catalogue/stats";
import type {
  HeroSuggestion,
  HeroSuggestionPool,
} from "@/lib/catalogue/suggestions";
import { ROUTES } from "@/lib/routes";

/**
 * Developer-owned homepage content (spec #8). Everything here ships via code;
 * nothing is fetched or stored. Missing external inputs (YouTube ID,
 * Instagram token, certifications, testimonials, address) are handled by the
 * sections that consume them, not by inventing values here.
 */

export type HomeCategoryCard = {
  displayName: string;
  slug: CategorySlug;
  blurb: string;
  /** Number of Patterns in this Category (from the master dataset). */
  patterns: number;
};

const CATEGORY_CARD_BLURBS: Partial<Record<CategorySlug, string>> = {
  motorcycle: "Grip and handling for every ride, on road and off.",
  "three-wheeler":
    "Durable tyres built for the daily load of three-wheeled transport.",
  "truck-bus":
    "Bias and radial constructions engineered for freight and passenger duty.",
  agriculture:
    "Traction and soil protection for tractors and farm machinery.",
  otr: "Off-the-road tyres for mining, construction and heavy equipment.",
  forklift:
    "Solid and pneumatic tyres for forklifts and industrial handling.",
};

/**
 * The six canonical categories shown in the homepage product-range showcase.
 * Tubes is excluded here (its data is deferred) even though it remains in the
 * Products navigation — see the integration-review patch on spec #8.
 */
export const HOME_CATEGORY_CARDS: readonly HomeCategoryCard[] =
  CATEGORIES.filter((category) => category.slug !== "tubes").map(
    (category) => ({
      displayName: category.displayName,
      slug: category.slug,
      blurb: CATEGORY_CARD_BLURBS[category.slug] ?? "",
      patterns: PATTERNS_BY_CATEGORY[category.slug] ?? 0,
    }),
  );

/**
 * Aggregate catalogue figures for editorial use. These are derived from the
 * master dataset — never invented.
 */
export const HOME_STATS = [
  { value: CATALOGUE_STATS.productRanges, label: "Product ranges" },
  { value: CATALOGUE_STATS.patterns, label: "Patterns" },
  { value: CATALOGUE_STATS.variants, label: "Size variants" },
] as const;

export type Certification = {
  name: string;
  detail: string;
  /** Local asset path, or `null` when no asset was supplied. */
  logo: string | null;
};

/**
 * Certification marks for the homepage. None have been supplied yet, so this
 * is empty and the section renders a labelled placeholder. Add entries here
 * only when Safeway supplies the marks; never invent certification names.
 */
export const CERTIFICATIONS: readonly Certification[] = [];

export type Testimonial = {
  quote: string;
  author: string;
  location: string;
};

/**
 * Customer testimonials for the homepage. None have been supplied yet, so
 * this is empty and the section renders a labelled placeholder rather than
 * inventing quotes.
 */
export const TESTIMONIALS: readonly Testimonial[] = [];

const HERO_SIZE_SUGGESTION_LIMIT = 24;

/**
 * The pool the hero search suggestions rotate through. Every value is taken
 * from the bundled master dataset — categories, real Variant sizes and real
 * functional/display names — so nothing is invented. Built once at module load
 * and passed to the client search box.
 */
function buildHeroSuggestionPool(): HeroSuggestionPool {
  const category: HeroSuggestion[] = HOME_CATEGORY_CARDS.map((card) => ({
    kind: "category",
    label: card.displayName,
    hint: `${card.patterns} ${card.patterns === 1 ? "pattern" : "patterns"}`,
    query: card.displayName,
    href: ROUTES.category(card.slug),
  }));

  const name: HeroSuggestion[] = [];
  const size: HeroSuggestion[] = [];
  const seenNames = new Set<string>();
  const seenSizes = new Set<string>();

  for (const pattern of CATALOGUE.patterns) {
    const categoryInfo = getCategory(pattern.categorySlug);
    const isFunctionalName =
      categoryInfo !== undefined &&
      pattern.displayName !== categoryInfo.displayName;

    if (isFunctionalName && !seenNames.has(pattern.displayName)) {
      seenNames.add(pattern.displayName);
      name.push({
        kind: "name",
        label: pattern.displayName,
        hint: pattern.patternCode,
        query: pattern.displayName,
        href: ROUTES.pattern(pattern.categorySlug, pattern.slug),
      });
    }

    for (const variantSize of patternSizes(pattern)) {
      if (seenSizes.has(variantSize)) {
        continue;
      }
      seenSizes.add(variantSize);
      size.push({
        kind: "size",
        label: variantSize,
        hint: pattern.patternCode,
        query: variantSize,
        href: ROUTES.pattern(pattern.categorySlug, pattern.slug),
      });
    }
  }

  return {
    category,
    size: size.slice(0, HERO_SIZE_SUGGESTION_LIMIT),
    name,
  };
}

export const HERO_SUGGESTION_POOL: HeroSuggestionPool =
  buildHeroSuggestionPool();

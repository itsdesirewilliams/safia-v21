import {
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  getCategory,
  type CategorySlug,
} from "@/lib/catalogue/categories";
import { CATALOGUE, patternSizes } from "@/lib/catalogue/dataset";
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
      blurb: CATEGORY_DESCRIPTIONS[category.slug],
    }),
  );

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
 * Temporary sample testimonials for the homepage. These are clearly fictional
 * placeholders shown until real customer stories are supplied; replace the
 * entries here when Safeway provides approved testimonials. No photos are used.
 */
export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      "The samples matched the catalogue specifications exactly and the shipment reached us on schedule.",
    author: "Juan Carlos",
    location: "Brazil",
  },
  {
    quote:
      "Clear sizes, quick answers and a straightforward ordering process from start to finish.",
    author: "Aisha Rahman",
    location: "United Arab Emirates",
  },
  {
    quote:
      "A dependable partner for our agricultural range — the pattern data is easy to work with.",
    author: "Milan Novak",
    location: "Czech Republic",
  },
];

/** Makes the placeholder nature of the sample testimonials explicit. */
export const TESTIMONIALS_NOTE =
  "Sample testimonials shown as placeholders until customer stories are supplied.";

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
    hint: "Category",
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

import {
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  getCategory,
  type CategorySlug,
} from "@/lib/catalogue/categories";
import { CATALOGUE, patternSizes } from "@/lib/catalogue/dataset";
import {
  RANGE_DATASETS,
  rangePatternSizes,
  type RangeId,
} from "@/lib/catalogue/range-data";
import type {
  HeroSuggestion,
  HeroSuggestionPool,
} from "@/lib/catalogue/suggestions";
import { titleCasePhrase } from "@/lib/catalogue/suggestions";
import { countryCode } from "@/lib/contact/countries";
import { ROUTES } from "@/lib/routes";
import { normalizeTyreSize } from "@/lib/search/tyre-size";

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

export type Testimonial = {
  quote: string;
  author: string;
  location: string;
  /** ISO 3166-1 alpha-2 code for `location`, or null when unresolved. */
  countryCode: string | null;
  /**
   * Every entry ships as a draft. No approved customer quotation has been
   * supplied for these markets, so the cards are marked as placeholders
   * rather than published as verified endorsements.
   */
  status: "draft";
};

/**
 * The placeholder copy used by the draft entries. It is deliberately explicit
 * so a draft card can never be read as a real customer quotation.
 */
const DRAFT_QUOTE =
  "Draft placeholder — the approved customer quotation for this market has not been supplied yet.";

/**
 * Homepage testimonials.
 *
 * No approved customer testimonials have been supplied for any of these
 * markets, so every entry is a clearly marked draft. The first three are the
 * long-standing sample entries; the remaining seven are the slots opened for
 * Chile, Peru, Egypt, Bolivia, Kenya, Tanzania and Malawi. Replace the draft
 * fields here with approved quotes, names and, if available, company details
 * — no admin or database step is involved.
 *
 * No photos are used — each entry shows the person, their country and that
 * country's flag.
 */
export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      "The samples matched the catalogue specifications exactly and the shipment reached us on schedule.",
    author: "Juan Carlos",
    location: "Brazil",
    countryCode: countryCode("Brazil"),
    status: "draft",
  },
  {
    quote:
      "Clear sizes, quick answers and a straightforward ordering process from start to finish.",
    author: "Aisha Rahman",
    location: "United Arab Emirates",
    countryCode: countryCode("United Arab Emirates"),
    status: "draft",
  },
  {
    quote:
      "A dependable partner for our agricultural range — the pattern data is easy to work with.",
    author: "Milan Novak",
    location: "Czechia",
    countryCode: countryCode("Czechia"),
    status: "draft",
  },
  {
    quote: DRAFT_QUOTE,
    author: "Name to be supplied",
    location: "Chile",
    countryCode: countryCode("Chile"),
    status: "draft",
  },
  {
    quote: DRAFT_QUOTE,
    author: "Name to be supplied",
    location: "Peru",
    countryCode: countryCode("Peru"),
    status: "draft",
  },
  {
    quote: DRAFT_QUOTE,
    author: "Name to be supplied",
    location: "Egypt",
    countryCode: countryCode("Egypt"),
    status: "draft",
  },
  {
    quote: DRAFT_QUOTE,
    author: "Name to be supplied",
    location: "Bolivia",
    countryCode: countryCode("Bolivia"),
    status: "draft",
  },
  {
    quote: DRAFT_QUOTE,
    author: "Name to be supplied",
    location: "Kenya",
    countryCode: countryCode("Kenya"),
    status: "draft",
  },
  {
    quote: DRAFT_QUOTE,
    author: "Name to be supplied",
    location: "Tanzania",
    countryCode: countryCode("Tanzania"),
    status: "draft",
  },
  {
    quote: DRAFT_QUOTE,
    author: "Name to be supplied",
    location: "Malawi",
    countryCode: countryCode("Malawi"),
    status: "draft",
  },
];

const HERO_SIZE_SUGGESTION_LIMIT = 48;

/** The public name and route for each radial range (no Pattern Codes). */
const RANGE_PUBLIC: Record<RangeId, { name: string; href: string }> = {
  tbr: { name: "Truck & Bus Radial Tyres", href: ROUTES.tbrSafeway },
  pcr: { name: "Passenger Car Radial Tyres", href: ROUTES.pcrSafeway },
};

/**
 * The pool the hero search suggestions rotate through. Every value is taken
 * from the bundled catalogue — categories, real Variant sizes (including the
 * TBR/PCR radial ranges) and real functional/display names — so nothing is
 * invented and no Pattern Code is ever exposed. Built once at module load and
 * passed to the client search box.
 */
function buildHeroSuggestionPool(): HeroSuggestionPool {
  const category: HeroSuggestion[] = [
    ...HOME_CATEGORY_CARDS.map((card) => ({
      kind: "category" as const,
      label: card.displayName,
      hint: "Category",
      query: card.displayName,
      href: ROUTES.category(card.slug),
    })),
    ...(Object.keys(RANGE_PUBLIC) as RangeId[]).map((range) => ({
      kind: "category" as const,
      label: RANGE_PUBLIC[range].name,
      hint: "Range",
      query: RANGE_PUBLIC[range].name,
      href: RANGE_PUBLIC[range].href,
    })),
  ];

  const name: HeroSuggestion[] = [];
  const size: HeroSuggestion[] = [];
  const seenNames = new Set<string>();
  const seenSizes = new Set<string>();

  for (const pattern of CATALOGUE.patterns) {
    const categoryInfo = getCategory(pattern.categorySlug);
    const categoryLabel = categoryInfo?.displayName ?? pattern.categorySlug;
    const isFunctionalName =
      categoryInfo !== undefined &&
      pattern.displayName !== categoryInfo.displayName;

    if (isFunctionalName && !seenNames.has(pattern.displayName)) {
      seenNames.add(pattern.displayName);
      name.push({
        kind: "name",
        label: pattern.displayName,
        hint: categoryLabel,
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
        hint: categoryLabel,
        query: variantSize,
        href: ROUTES.pattern(pattern.categorySlug, pattern.slug),
      });
    }
  }

  // Radial ranges: discoverable by real size (never by Pattern Code).
  for (const range of Object.keys(RANGE_PUBLIC) as RangeId[]) {
    const dataset = RANGE_DATASETS[range];
    for (const pattern of dataset.patterns) {
      const href =
        range === "tbr"
          ? ROUTES.tbrPattern(pattern.slug)
          : ROUTES.pcrPattern(pattern.slug);
      for (const rawSize of rangePatternSizes(pattern)) {
        const label = normalizeTyreSize(rawSize) ?? rawSize;
        if (seenSizes.has(label)) {
          continue;
        }
        seenSizes.add(label);
        size.push({
          kind: "size",
          label,
          hint: RANGE_PUBLIC[range].name,
          query: label,
          href,
        });
      }
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

/**
 * The rotating phrases for the hero search placeholder's typewriter, drawn from
 * the same real dataset values as the suggestion pool. Interleaved
 * category → size → functional-name so each cycle shows all three kinds, and
 * Title-Cased for display (the underlying search terms are unchanged).
 */
function buildPlaceholderPhrases(pool: HeroSuggestionPool): string[] {
  const groups = [pool.category, pool.size, pool.name].map((bucket) =>
    bucket.map((item) =>
      item.kind === "name" ? titleCasePhrase(item.label) : item.label,
    ),
  );

  const phrases: string[] = [];
  const seen = new Set<string>();
  const longest = groups.reduce((max, group) => Math.max(max, group.length), 0);

  for (let index = 0; index < longest; index += 1) {
    for (const group of groups) {
      const label = group[index];
      if (label && !seen.has(label)) {
        seen.add(label);
        phrases.push(label);
      }
    }
  }

  return phrases;
}

export const HERO_PLACEHOLDER_PHRASES: readonly string[] =
  buildPlaceholderPhrases(HERO_SUGGESTION_POOL);

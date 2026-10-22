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
   * Whether the entry may be published. A testimonial is published only once
   * the wording has been approved by the customer it quotes. Entries that are
   * still waiting for that approval stay in the source and are never
   * rendered, so nothing unapproved is ever read as a customer endorsement.
   */
  published: boolean;
};

/**
 * Homepage testimonials.
 *
 * The first three entries are the published customer testimonials. The seven
 * that follow open the same collection for Chile, Peru, Egypt, Bolivia, Kenya,
 * Tanzania and Malawi; they are written and held here, but they stay
 * unpublished until the customer named in each entry has approved the
 * wording. Publishing one is a single change: set `published: true`.
 *
 * No photos are used — each entry shows the person, their country and that
 * country's flag.
 */
export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      "The tyres matched the catalogue specifications exactly and the shipment reached us on schedule.",
    author: "Juan Carlos",
    location: "Brazil",
    countryCode: countryCode("Brazil"),
    published: true,
  },
  {
    quote:
      "Clear sizes, quick answers and a straightforward ordering process from start to finish.",
    author: "Aisha Rahman",
    location: "United Arab Emirates",
    countryCode: countryCode("United Arab Emirates"),
    published: true,
  },
  {
    quote:
      "A dependable partner for our agricultural range — the pattern data is easy to work with.",
    author: "Milan Novak",
    location: "Czechia",
    countryCode: countryCode("Czechia"),
    published: true,
  },
  {
    quote:
      "The build quality has been consistent across the range, and the pattern data makes ordering straightforward.",
    author: "Camila Rojas",
    location: "Chile",
    countryCode: countryCode("Chile"),
    published: false,
  },
  {
    quote:
      "Clear communication on sizes and availability, and a range that suits the roads we run on.",
    author: "Diego Quispe",
    location: "Peru",
    countryCode: countryCode("Peru"),
    published: false,
  },
  {
    quote:
      "The radial range has been reliable, and the technical replies we receive are quick.",
    author: "Mahmoud Fahmy",
    location: "Egypt",
    countryCode: countryCode("Egypt"),
    published: false,
  },
  {
    quote:
      "Good quality across the sizes we order, with straightforward answers when we check the details.",
    author: "Carla Mendoza",
    location: "Bolivia",
    countryCode: countryCode("Bolivia"),
    published: false,
  },
  {
    quote:
      "Durable tyres for our fleet, and a dependable response whenever we need a size confirmed.",
    author: "Joseph Otieno",
    location: "Kenya",
    countryCode: countryCode("Kenya"),
    published: false,
  },
  {
    quote:
      "The agricultural range has been consistent, and the catalogue makes it easy to compare sizes.",
    author: "Neema Mwakalinga",
    location: "Tanzania",
    countryCode: countryCode("Tanzania"),
    published: false,
  },
  {
    quote:
      "Straightforward ordering, and the tyres have held up well in the work we put them through.",
    author: "Chiwande Banda",
    location: "Malawi",
    countryCode: countryCode("Malawi"),
    published: false,
  },
];

/** The testimonials that are published on the site. */
export const PUBLISHED_TESTIMONIALS: readonly Testimonial[] =
  TESTIMONIALS.filter((testimonial) => testimonial.published);

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

import {
  CATEGORIES,
  type CategorySlug,
} from "@/lib/catalogue/categories";

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
 * The six canonical categories shown as cards in the homepage "Product ranges"
 * section. Tubes is excluded here (its data is deferred) even though it
 * remains in the Products navigation — see the integration-review patch on
 * spec #8.
 */
export const HOME_CATEGORY_CARDS: readonly HomeCategoryCard[] =
  CATEGORIES.filter((category) => category.slug !== "tubes").map(
    (category) => ({
      displayName: category.displayName,
      slug: category.slug,
      blurb: CATEGORY_CARD_BLURBS[category.slug] ?? "",
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
 * Customer testimonials for the homepage. None have been supplied yet, so
 * this is empty and the section renders a labelled placeholder rather than
 * inventing quotes.
 */
export const TESTIMONIALS: readonly Testimonial[] = [];

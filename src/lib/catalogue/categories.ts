export const CATEGORIES = [
  { displayName: "Motorcycle Tyres", slug: "motorcycle" },
  { displayName: "Three Wheeler Tyres", slug: "three-wheeler" },
  { displayName: "Truck & Bus Tyres", slug: "truck-bus" },
  { displayName: "Agriculture Tyres", slug: "agriculture" },
  { displayName: "Off-The-Road (OTR) Tyres", slug: "otr" },
  { displayName: "Forklift Tyres", slug: "forklift" },
  { displayName: "Tubes", slug: "tubes" },
] as const satisfies readonly { displayName: string; slug: string }[];

export type Category = (typeof CATEGORIES)[number];
export type CategorySlug = Category["slug"];

/**
 * Customer-facing one-line descriptions for each range. Display copy only —
 * never product data — shared by the homepage range cards and the catalogue.
 */
export const CATEGORY_DESCRIPTIONS: Record<CategorySlug, string> = {
  motorcycle:
    "Reliable tyre solutions designed for everyday riding and demanding road conditions.",
  "three-wheeler":
    "Durable tyres built for the daily load of three-wheeled transport.",
  "truck-bus":
    "Bias and radial tyres engineered for freight and passenger duty.",
  agriculture:
    "Purpose-built tyres for tractors and agricultural equipment across varied working conditions.",
  otr: "Off-the-road tyres for mining, construction and heavy equipment.",
  forklift:
    "Solid and pneumatic tyres for forklifts and industrial handling.",
  tubes: "Inner tubes for a range of tyre applications.",
};

export function isCategorySlug(value: string): value is CategorySlug {
  return CATEGORIES.some((category) => category.slug === value);
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

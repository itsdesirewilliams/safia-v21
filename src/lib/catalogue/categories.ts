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

export function isCategorySlug(value: string): value is CategorySlug {
  return CATEGORIES.some((category) => category.slug === value);
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

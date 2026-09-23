import { CATEGORIES, type CategorySlug } from "@/lib/catalogue/categories";

/**
 * The public routing map — the single source of truth for every public URL
 * (spec #10). Dynamic routes are declared as Next.js patterns; concrete URLs
 * are produced through `ROUTES`.
 */
export const ROUTING_MAP = {
  home: "/",
  aboutUs: "/about-us",
  warranty: "/warranty",
  contactUs: "/contact-us",
  gallery: "/gallery",
  qualityFirst: "/quality-first",
  catalogue: "/catalogue",
  categoryListing: "/products/[category]",
  patternDetail: "/products/[category]/[pattern]",
  blogListing: "/blogs",
  post: "/blogs/[slug]",
} as const;

export const ROUTES = {
  home: ROUTING_MAP.home,
  aboutUs: ROUTING_MAP.aboutUs,
  warranty: ROUTING_MAP.warranty,
  contactUs: ROUTING_MAP.contactUs,
  gallery: ROUTING_MAP.gallery,
  qualityFirst: ROUTING_MAP.qualityFirst,
  catalogue: ROUTING_MAP.catalogue,
  blogs: ROUTING_MAP.blogListing,
  category: (slug: CategorySlug) => `/products/${slug}`,
  pattern: (category: CategorySlug, pattern: string) =>
    `/products/${category}/${pattern}`,
  post: (slug: string) => `/blogs/${slug}`,
} as const;

/** A labelled link to a route in the routing map. */
export type NavLink = {
  label: string;
  href: string;
};

/**
 * A header item: either a plain link or a dropdown of links (Products).
 */
export type NavItem =
  | NavLink
  | { label: string; children: readonly NavLink[] };

const PRODUCTS_CHILDREN: readonly NavLink[] = CATEGORIES.map((category) => ({
  label: category.displayName,
  href: ROUTES.category(category.slug),
}));

/**
 * Header primary navigation. Products is a dropdown of the seven canonical
 * categories; Gallery is reached from the footer (per spec #7 patch).
 */
export const PRIMARY_NAV: readonly NavItem[] = [
  { label: "About Us", href: ROUTES.aboutUs },
  { label: "Catalogue", href: ROUTES.catalogue },
  { label: "Products", children: PRODUCTS_CHILDREN },
  { label: "Contact Us", href: ROUTES.contactUs },
  { label: "Quality First", href: ROUTES.qualityFirst },
  { label: "Warranty", href: ROUTES.warranty },
  { label: "Blogs", href: ROUTES.blogs },
];

/** Footer key links. */
export const FOOTER_NAV: readonly NavLink[] = [
  { label: "About Us", href: ROUTES.aboutUs },
  { label: "Catalogue", href: ROUTES.catalogue },
  { label: "Quality First", href: ROUTES.qualityFirst },
  { label: "Gallery", href: ROUTES.gallery },
  { label: "Blogs", href: ROUTES.blogs },
  { label: "Warranty", href: ROUTES.warranty },
  { label: "Contact Us", href: ROUTES.contactUs },
];

/**
 * Concrete paths exercised by the route-resolution test. Dynamic routes use
 * representative slugs; the Pattern slug is a real catalogue pattern (the
 * Pattern detail route now 404s unknown slugs), while the Post slug remains a
 * placeholder until its owning ticket lands.
 */
export const SMOKE_ROUTES: readonly string[] = [
  ROUTES.home,
  ROUTES.aboutUs,
  ROUTES.warranty,
  ROUTES.contactUs,
  ROUTES.gallery,
  ROUTES.qualityFirst,
  ROUTES.catalogue,
  ...CATEGORIES.map((category) => ROUTES.category(category.slug)),
  ROUTES.pattern("motorcycle", "motorcycle-tyres-sfm-101"),
  ROUTES.blogs,
  ROUTES.post("example-post"),
];

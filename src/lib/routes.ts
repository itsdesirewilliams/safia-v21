import {
  CATEGORIES,
  PRODUCT_MENU_ORDER,
  type CategorySlug,
} from "@/lib/catalogue/categories";

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
  search: "/search",
  categoryListing: "/products/[category]",
  patternDetail: "/products/[category]/[pattern]",
  // The radial ranges sit beside the existing Nylon Truck & Bus category.
  tbrSafeway: "/products/truck-bus-tire/tbr-safeway",
  tbrPatternDetail: "/products/truck-bus-tire/tbr-safeway/[pattern]",
  pcrSafeway: "/products/truck-bus-tire/pcr-safeway",
  pcrPatternDetail: "/products/truck-bus-tire/pcr-safeway/[pattern]",
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
  search: ROUTING_MAP.search,
  blogs: ROUTING_MAP.blogListing,
  category: (slug: CategorySlug) => `/products/${slug}`,
  pattern: (category: CategorySlug, pattern: string) =>
    `/products/${category}/${pattern}`,
  tbrSafeway: ROUTING_MAP.tbrSafeway,
  tbrPattern: (pattern: string) =>
    `/products/truck-bus-tire/tbr-safeway/${pattern}`,
  pcrSafeway: ROUTING_MAP.pcrSafeway,
  pcrPattern: (pattern: string) =>
    `/products/truck-bus-tire/pcr-safeway/${pattern}`,
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

/**
 * The seven product ranges in their canonical menu order (two-column layout).
 * Kept in the routing map so the header, the footer and the route tests share a
 * single source of truth for the order.
 */
const PRODUCTS_CHILDREN: readonly NavLink[] = PRODUCT_MENU_ORDER.map((slug) => {
  const category = CATEGORIES.find((entry) => entry.slug === slug);
  return {
    label: category?.displayName ?? slug,
    href: ROUTES.category(slug),
  };
});

/**
 * Header primary navigation. Products is a dropdown of the seven canonical
 * categories; Gallery is reached from the footer (per spec #7 patch).
 */
export const PRIMARY_NAV: readonly NavItem[] = [
  { label: "Home", href: ROUTES.home },
  { label: "About Us", href: ROUTES.aboutUs },
  { label: "Catalogue", href: ROUTES.catalogue },
  { label: "Products", children: PRODUCTS_CHILDREN },
  { label: "Contact Us", href: ROUTES.contactUs },
  { label: "Quality First", href: ROUTES.qualityFirst },
  { label: "Gallery", href: ROUTES.gallery },
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
 * Concrete paths exercised by the route-resolution test. Dynamic routes use a
 * real catalogue Pattern slug (the Pattern detail route 404s unknown slugs).
 * The Post detail route is deliberately excluded: its slugs are CMS content, so
 * there is no fixed slug that resolves without seeded data — the Blogs e2e test
 * covers it with a fixture.
 */
export const SMOKE_ROUTES: readonly string[] = [
  ROUTES.home,
  ROUTES.aboutUs,
  ROUTES.warranty,
  ROUTES.contactUs,
  ROUTES.gallery,
  ROUTES.qualityFirst,
  ROUTES.catalogue,
  ROUTES.search,
  ...CATEGORIES.map((category) => ROUTES.category(category.slug)),
  ROUTES.pattern("motorcycle", "motorcycle-tyres-sfm-101"),
  ROUTES.blogs,
];

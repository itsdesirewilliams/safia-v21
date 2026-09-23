import { describe, expect, it } from "vitest";

import { CATEGORIES } from "@/lib/catalogue/categories";
import {
  FOOTER_NAV,
  PRIMARY_NAV,
  ROUTES,
  ROUTING_MAP,
  SMOKE_ROUTES,
  type NavItem,
  type NavLink,
} from "@/lib/routes";

const EXPECTED_PATTERNS = [
  "/",
  "/about-us",
  "/warranty",
  "/contact-us",
  "/gallery",
  "/quality-first",
  "/catalogue",
  "/products/[category]",
  "/products/[category]/[pattern]",
  "/blogs",
  "/blogs/[slug]",
];

function linksOf(items: readonly NavItem[]) {
  return items.flatMap((item) =>
    "children" in item ? [...item.children] : [item],
  );
}

function isNavLink(item: NavItem): item is NavLink {
  return !("children" in item);
}

describe("routing map", () => {
  it("declares every public route pattern", () => {
    for (const pattern of EXPECTED_PATTERNS) {
      expect(Object.values(ROUTING_MAP)).toContain(pattern);
    }
  });

  it("exposes a concrete path for every smoke route", () => {
    for (const route of SMOKE_ROUTES) {
      expect(route.startsWith("/")).toBe(true);
      expect(route).not.toContain("[");
    }
  });
});

describe("header navigation", () => {
  it("includes every primary destination", () => {
    expect(PRIMARY_NAV.map((item) => item.label)).toEqual([
      "About Us",
      "Catalogue",
      "Products",
      "Contact Us",
      "Quality First",
      "Warranty",
      "Blogs",
    ]);
  });

  it("links each non-dropdown item to its route", () => {
    const hrefs = PRIMARY_NAV.filter(isNavLink).map((item) => item.href);
    expect(hrefs).toEqual([
      ROUTES.aboutUs,
      ROUTES.catalogue,
      ROUTES.contactUs,
      ROUTES.qualityFirst,
      ROUTES.warranty,
      ROUTES.blogs,
    ]);
  });

  it("lists all seven categories in the Products dropdown", () => {
    const products = PRIMARY_NAV.find((item) => item.label === "Products");
    expect(products && "children" in products).toBe(true);
    if (!products || !("children" in products)) {
      throw new Error("Products dropdown is missing");
    }
    expect(products.children).toHaveLength(7);
    expect(products.children.map((child) => child.href)).toEqual(
      CATEGORIES.map((category) => `/products/${category.slug}`),
    );
  });

  it("has no link pointing outside the routing map", () => {
    const known = new Set<string>([
      ...Object.values(ROUTING_MAP).filter((value) => !value.includes("[")),
      ...CATEGORIES.map((category) => `/products/${category.slug}`),
    ]);

    for (const link of [...linksOf(PRIMARY_NAV), ...FOOTER_NAV]) {
      expect(known.has(link.href)).toBe(true);
    }
  });
});

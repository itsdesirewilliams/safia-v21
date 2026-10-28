import {
  CORPORATE_OFFICE_ADDRESS,
  SITE,
  SOCIAL_LINKS,
} from "@/lib/site";
import { absoluteUrl, SITE_URL } from "./site";

/** JSON-LD is serialised by a client component; these are plain objects. */
export type JsonLdNode = Record<string, unknown>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * The company entity. Only facts already published on the site are used:
 * name, legal name, public contact details, corporate office and the official
 * social profiles. No certifications, ratings or offers are invented.
 */
export function organizationSchema(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE_URL,
    logo: absoluteUrl("/brand/safeway-logo-black.png"),
    email: SITE.emails.marketingGeneral,
    telephone: SITE.phone.primary,
    address: {
      "@type": "PostalAddress",
      streetAddress: "SCO No. 21, SEC 17, Omaxe Residency Pakhowal Road",
      addressLocality: "Ludhiana",
      postalCode: "142022",
      addressCountry: "IN",
    },
    sameAs: SOCIAL_LINKS.map((link) => link.url),
  };
}

/** The site entity, including the internal catalogue search action. */
export function websiteSchema(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE.name,
    publisher: { "@id": ORGANIZATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbSchema(items: readonly BreadcrumbItem[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export type ProductSchemaInput = {
  name: string;
  patternCode: string;
  category: string;
  path: string;
  description?: string;
  imageUrl?: string | null;
  sizes?: readonly string[];
};

/**
 * A Pattern as a Product. It carries only catalogue facts: pattern code (SKU),
 * category, display name and the sizes present in the dataset. There is no
 * price, availability, rating or offer because the business does not publish
 * them.
 */
export function productSchema(input: ProductSchemaInput): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${absoluteUrl(input.path)}#product`,
    name: input.name,
    sku: input.patternCode,
    category: input.category,
    ...(input.description ? { description: input.description } : {}),
    brand: { "@type": "Brand", name: SITE.name },
    url: absoluteUrl(input.path),
    ...(input.imageUrl ? { image: absoluteUrl(input.imageUrl) } : {}),
    ...(input.sizes && input.sizes.length > 0
      ? {
          additionalProperty: {
            "@type": "PropertyValue",
            name: "Available sizes",
            value: input.sizes.join(", "),
          },
        }
      : {}),
  };
}

export type ArticleSchemaInput = {
  headline: string;
  description?: string | null;
  path: string;
  author: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  imageUrl?: string | null;
};

export function articleSchema(input: ArticleSchemaInput): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(input.path)}#article`,
    headline: input.headline,
    ...(input.description ? { description: input.description } : {}),
    url: absoluteUrl(input.path),
    mainEntityOfPage: absoluteUrl(input.path),
    author: { "@type": "Person", name: input.author },
    publisher: { "@id": ORGANIZATION_ID },
    ...(input.publishedAt ? { datePublished: input.publishedAt } : {}),
    ...(input.updatedAt ? { dateModified: input.updatedAt } : {}),
    ...(input.imageUrl ? { image: absoluteUrl(input.imageUrl) } : {}),
  };
}

/** Exposed for tests: the corporate address used in structured data. */
export const STRUCTURED_ADDRESS = CORPORATE_OFFICE_ADDRESS;

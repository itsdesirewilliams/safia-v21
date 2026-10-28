import type { Metadata } from "next";

import { getActiveLocale } from "@/lib/i18n/server";
import { localizedAlternates } from "@/lib/i18n/url";

import { ogLocale } from "./site";

export type PageMetadataInput = {
  /** A page title (template applied) or `{ absolute }` to bypass the template. */
  title: string | { absolute: string };
  description?: string;
  /** Canonical English path, e.g. `/products/agriculture`. */
  path: string;
  type?: "website" | "article";
  images?: readonly { url: string; alt: string }[];
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
};

/**
 * Locale-aware page metadata.
 *
 * Every indexable page gets a self-referencing canonical URL in the active
 * locale, a complete set of hreflang alternates (plus `x-default`), and Open
 * Graph/Twitter tags that agree with the canonical. Pages that must not be
 * indexed (internal search) opt out explicitly.
 */
export async function pageMetadata(
  input: PageMetadataInput,
): Promise<Metadata> {
  const locale = await getActiveLocale();
  const alternates = localizedAlternates(locale, input.path);
  const title =
    typeof input.title === "string" ? input.title : input.title.absolute;
  const images =
    input.images && input.images.length > 0
      ? input.images
      : [
          {
            url: "/opengraph-image",
            alt: "Safeway Tyre — Exporting Durable Tyres Worldwide",
          },
        ];

  return {
    title: input.title,
    description: input.description,
    alternates,
    ...(input.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: input.type ?? "website",
      title,
      description: input.description,
      url: alternates.canonical,
      siteName: "Safeway Tyre",
      locale: ogLocale(locale),
      images: images.map((image) => ({ ...image })),
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
      images: images.map((image) => image.url),
    },
  };
}

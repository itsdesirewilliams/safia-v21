import type { MetadataRoute } from "next";

import { CATEGORIES } from "@/lib/catalogue/categories";
import { CATALOGUE } from "@/lib/catalogue/dataset";
import {
  HIDDEN_TBR_PATTERN_CODES,
  listRangePatterns,
} from "@/lib/catalogue/range-data";
import { PREFIXED_LOCALES } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/url";
import { ROUTES } from "@/lib/routes";
import { SITE_URL } from "@/lib/seo/site";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  ROUTES.home,
  ROUTES.aboutUs,
  ROUTES.catalogue,
  ROUTES.contactUs,
  ROUTES.gallery,
  ROUTES.qualityFirst,
  ROUTES.warranty,
  ROUTES.blogs,
] as const;

type Entry = MetadataRoute.Sitemap[number];

/**
 * Every crawlable public URL: static pages, the canonical categories, every
 * catalogue Pattern, the TBR/PCR ranges and their Patterns, plus published
 * blog posts. Each English path is also emitted for every prefixed locale that
 * the site actually serves. Admin, API and internal search URLs never appear.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = new Set<string>(STATIC_PATHS);

  for (const category of CATEGORIES) {
    paths.add(ROUTES.category(category.slug));
  }

  for (const pattern of CATALOGUE.patterns) {
    paths.add(ROUTES.pattern(pattern.categorySlug, pattern.slug));
  }

  paths.add(ROUTES.tbrSafeway);
  paths.add(ROUTES.pcrSafeway);

  for (const pattern of listRangePatterns("tbr")) {
    if (!HIDDEN_TBR_PATTERN_CODES.has(pattern.patternCode)) {
      paths.add(ROUTES.tbrPattern(pattern.slug));
    }
  }

  for (const pattern of listRangePatterns("pcr")) {
    paths.add(ROUTES.pcrPattern(pattern.slug));
  }

  const posts = await listPublishedPostsForSitemap();
  for (const post of posts) {
    paths.add(ROUTES.post(post.slug));
  }

  const postDate = new Map(posts.map((post) => [ROUTES.post(post.slug), post.publishedAt]));

  const entries = new Map<string, Entry>();

  const add = (path: string, lastModified?: string | null) => {
    const url = `${SITE_URL}${path}`;
    if (entries.has(url)) {
      return;
    }
    entries.set(url, {
      url,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : path.startsWith("/products/") ? 0.7 : 0.8,
    });
  };

  for (const path of paths) {
    const lastModified = postDate.get(path);
    add(localizedHref("en", path), lastModified);
    for (const locale of PREFIXED_LOCALES) {
      add(localizedHref(locale, path), lastModified);
    }
  }

  return [...entries.values()];
}

async function listPublishedPostsForSitemap(): Promise<
  { slug: string; publishedAt: string | null }[]
> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("posts")
      .select("slug, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      return [];
    }

    return ((data ?? []) as { slug: string; published_at: string | null }[])
      .filter((row) => Boolean(row.slug))
      .map((row) => ({ slug: row.slug, publishedAt: row.published_at }));
  } catch {
    // The sitemap must never fail because the database or env is unavailable.
    return [];
  }
}

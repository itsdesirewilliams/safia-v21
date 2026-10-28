import { isCategorySlug } from "@/lib/catalogue/categories";
import { slugify } from "@/lib/slug";

import { cleanText, parsePostBlocks, type PostBlock } from "./blocks";

/**
 * The Post model (spec #2 / Ticket 9; extended for the block editor).
 *
 * A Post is Draft or Published; publishing sets `publishedAt` and unpublishing
 * returns it to Draft. There are no scheduled/archived states and no taxonomy
 * beyond the optional catalogue category. `author` is plain text, not an
 * entity. This module is pure so the content model can be tested without a
 * database.
 */

export const POST_STATUSES = ["draft", "published"] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export function isPostStatus(value: unknown): value is PostStatus {
  return (
    typeof value === "string" &&
    (POST_STATUSES as readonly string[]).includes(value)
  );
}

export function parsePostStatus(value: unknown): PostStatus | null {
  return isPostStatus(value) ? value : null;
}

export function postStatusLabel(status: PostStatus): string {
  return status === "published" ? "Published" : "Draft";
}

export const TITLE_MAX_LENGTH = 200;
export const AUTHOR_MAX_LENGTH = 120;
export const EXCERPT_MAX_LENGTH = 500;
export const SLUG_MAX_LENGTH = 200;
/** Optional SEO overrides. Blank values fall back to title/excerpt. */
export const SEO_TITLE_MAX_LENGTH = 120;
export const SEO_DESCRIPTION_MAX_LENGTH = 320;
/** The recommended visible length for a meta description. */
export const META_DESCRIPTION_RECOMMENDED = 160;

/** The blog listing page size (spec #2). */
export const POSTS_PER_PAGE = 12;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Derive a Post slug from its title. */
export function postSlugFromTitle(title: string): string {
  return slugify(title).slice(0, SLUG_MAX_LENGTH).replace(/-+$/g, "");
}

/**
 * A placeholder slug so an untitled draft can be saved before a title exists.
 * Drafts may be renamed freely; a published post always needs a real title and
 * slug (validated separately).
 */
export function draftSlug(now: Date = new Date(), random = Math.random): string {
  const suffix = random().toString(36).slice(2, 8) || "draft";
  return `draft-${now.getTime().toString(36)}-${suffix}`;
}

export type Post = {
  id: string;
  title: string;
  slug: string;
  author: string;
  excerpt: string | null;
  category: string | null;
  thumbnailMediaId: string | null;
  /** Optional SEO overrides (see the post_seo migration). */
  seoTitle: string | null;
  seoDescription: string | null;
  ogMediaId: string | null;
  body: PostBlock[];
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostSummary = Omit<Post, "body">;

export type PostInput = {
  title?: string | null;
  slug?: string | null;
  author?: string | null;
  excerpt?: string | null;
  category?: string | null;
  thumbnailMediaId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogMediaId?: string | null;
  body?: unknown;
};

export type PostInputValue = {
  title: string;
  slug: string;
  author: string;
  excerpt: string | null;
  category: string | null;
  thumbnailMediaId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogMediaId: string | null;
  body: PostBlock[];
};

export type PostValidation =
  | { ok: true; value: PostInputValue }
  | { ok: false; errors: Record<string, string> };

export type ValidatePostOptions = {
  /** Publishing requires a title; drafts may be completely empty. */
  requireTitle?: boolean;
  now?: Date;
  random?: () => number;
};

export function validatePostInput(
  input: PostInput,
  options: ValidatePostOptions = {},
): PostValidation {
  const { requireTitle = true, now = new Date(), random } = options;

  const parsedBody = parsePostBlocks(input.body ?? []);
  if (!parsedBody.ok) {
    return { ok: false, errors: { body: parsedBody.error } };
  }

  const errors: Record<string, string> = {};

  const title = cleanText(input.title);
  const authorInput = cleanText(input.author);
  const excerpt = cleanText(input.excerpt);
  const category = cleanText(input.category);
  const thumbnailMediaId = cleanText(input.thumbnailMediaId);
  const seoTitle = cleanText(input.seoTitle);
  const seoDescription = cleanText(input.seoDescription);
  const ogMediaId = cleanText(input.ogMediaId);

  if (!title && requireTitle) {
    errors.title = "Add a title before publishing.";
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `The title must be ${TITLE_MAX_LENGTH} characters or fewer.`;
  }

  // Publishing needs an author on the public byline; drafts may omit it.
  const author = authorInput || (requireTitle ? "Safeway Tyre" : "");
  if (author.length > AUTHOR_MAX_LENGTH) {
    errors.author = `The author must be ${AUTHOR_MAX_LENGTH} characters or fewer.`;
  }

  if (excerpt && excerpt.length > EXCERPT_MAX_LENGTH) {
    errors.excerpt = `The excerpt must be ${EXCERPT_MAX_LENGTH} characters or fewer.`;
  }

  if (category && !isCategorySlug(category)) {
    errors.category = "Choose a valid product category.";
  }

  if (seoTitle.length > SEO_TITLE_MAX_LENGTH) {
    errors.seoTitle = `The SEO title must be ${SEO_TITLE_MAX_LENGTH} characters or fewer.`;
  }

  if (seoDescription.length > SEO_DESCRIPTION_MAX_LENGTH) {
    errors.seoDescription = `The SEO description must be ${SEO_DESCRIPTION_MAX_LENGTH} characters or fewer.`;
  }

  const slugInput = cleanText(input.slug).toLowerCase();
  let slug = slugInput || (title ? postSlugFromTitle(title) : "");

  // A published post that still carries its draft slug gets a real URL.
  if (requireTitle && title && slug.startsWith("draft-")) {
    slug = postSlugFromTitle(title);
  }

  if (!slug) {
    if (requireTitle) {
      errors.slug = "A slug is required.";
    } else {
      slug = draftSlug(now, random ?? Math.random);
    }
  }

  if (slug.length > SLUG_MAX_LENGTH) {
    errors.slug = `The slug must be ${SLUG_MAX_LENGTH} characters or fewer.`;
  } else if (!SLUG_PATTERN.test(slug)) {
    errors.slug = "Use lowercase letters, numbers and dashes only.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      title,
      slug,
      author,
      excerpt: excerpt || null,
      category: category || null,
      thumbnailMediaId: thumbnailMediaId || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      ogMediaId: ogMediaId || null,
      body: parsedBody.blocks,
    },
  };
}

import { slugify } from "@/lib/slug";

import { cleanText, parsePostBlocks, type PostBlock } from "./blocks";

/**
 * The Post model (spec #2 / Ticket 9): fields, lifecycle and validation.
 *
 * A Post is Draft or Published; publishing sets `publishedAt` and unpublishing
 * returns it to Draft. There are no scheduled/archived states and no taxonomy.
 * `author` is plain text, not an entity. This module is pure so the content
 * model can be tested without a database.
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

/** The blog listing page size (spec #2). */
export const POSTS_PER_PAGE = 12;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Derive a Post slug from its title. */
export function postSlugFromTitle(title: string): string {
  return slugify(title).slice(0, SLUG_MAX_LENGTH).replace(/-+$/g, "");
}

export type Post = {
  id: string;
  title: string;
  slug: string;
  author: string;
  excerpt: string | null;
  thumbnailMediaId: string | null;
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
  thumbnailMediaId?: string | null;
  body?: unknown;
};

export type PostInputValue = {
  title: string;
  slug: string;
  author: string;
  excerpt: string | null;
  thumbnailMediaId: string | null;
  body: PostBlock[];
};

export type PostValidation =
  | { ok: true; value: PostInputValue }
  | { ok: false; errors: Record<string, string> };

export function validatePostInput(input: PostInput): PostValidation {
  const parsedBody = parsePostBlocks(input.body ?? []);
  if (!parsedBody.ok) {
    return { ok: false, errors: { body: parsedBody.error } };
  }

  const errors: Record<string, string> = {};

  const title = cleanText(input.title);
  const author = cleanText(input.author);
  const excerpt = cleanText(input.excerpt);
  const thumbnailMediaId = cleanText(input.thumbnailMediaId);

  if (!title) {
    errors.title = "A title is required.";
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `The title must be ${TITLE_MAX_LENGTH} characters or fewer.`;
  }

  if (!author) {
    errors.author = "An author is required.";
  } else if (author.length > AUTHOR_MAX_LENGTH) {
    errors.author = `The author must be ${AUTHOR_MAX_LENGTH} characters or fewer.`;
  }

  if (excerpt && excerpt.length > EXCERPT_MAX_LENGTH) {
    errors.excerpt = `The excerpt must be ${EXCERPT_MAX_LENGTH} characters or fewer.`;
  }

  const slugInput = cleanText(input.slug).toLowerCase();
  const slug = slugInput || (title ? postSlugFromTitle(title) : "");

  if (!slug) {
    errors.slug = "A slug is required.";
  } else if (slug.length > SLUG_MAX_LENGTH) {
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
      thumbnailMediaId: thumbnailMediaId || null,
      body: parsedBody.blocks,
    },
  };
}

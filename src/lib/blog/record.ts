import { parsePostBlocks, type PostBlock } from "./blocks";
import {
  parsePostStatus,
  type Post,
  type PostSummary,
} from "./post";

/**
 * Pure mapping between the `public.posts` row shape and the Post model. Kept
 * free of server-only imports so it can be tested directly.
 */

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  author: string;
  excerpt: string | null;
  thumbnail_media_id: string | null;
  body: unknown;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function blocksFrom(value: unknown): PostBlock[] {
  const parsed = parsePostBlocks(value);
  return parsed.ok ? parsed.blocks : [];
}

/** Map a database row to a Post; null when the row is malformed. */
export function mapPostRow(row: PostRow): Post | null {
  const status = parsePostStatus(row.status);
  if (!status || !row.id || !row.slug) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    author: row.author,
    excerpt: row.excerpt,
    thumbnailMediaId: row.thumbnail_media_id,
    body: blocksFrom(row.body),
    status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Drop the (potentially large) body for listing surfaces. */
export function toPostSummary(post: Post): PostSummary {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    author: post.author,
    excerpt: post.excerpt,
    thumbnailMediaId: post.thumbnailMediaId,
    status: post.status,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

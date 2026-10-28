import { getMediaByIds } from "@/lib/media/server";
import type { Media } from "@/lib/media/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { mapPostRow, toPostSummary, type PostRow } from "./record";
import {
  POSTS_PER_PAGE,
  type Post,
  type PostInputValue,
  type PostStatus,
  type PostSummary,
} from "./post";

/**
 * Server data access for Posts (spec #2 / Ticket 9).
 *
 * Every call uses the request's Supabase session client, so Postgres RLS — not
 * this code — is the authority: anonymous visitors only ever see published
 * posts, while admins/editors see everything. The functions here validate,
 * map and resolve thumbnails through the shared Media layer.
 */

export type PostWithThumbnail = Post & { thumbnail: Media | null };
export type PostSummaryWithThumbnail = PostSummary & { thumbnail: Media | null };

async function attachThumbnails<T extends { thumbnailMediaId: string | null }>(
  items: T[],
): Promise<(T & { thumbnail: Media | null })[]> {
  const ids = items
    .map((item) => item.thumbnailMediaId)
    .filter((id): id is string => Boolean(id));

  const media = ids.length > 0 ? await getMediaByIds(ids) : [];
  const byId = new Map(media.map((entry) => [entry.id, entry]));

  return items.map((item) => ({
    ...item,
    thumbnail: item.thumbnailMediaId
      ? (byId.get(item.thumbnailMediaId) ?? null)
      : null,
  }));
}

function mapRows(data: unknown): Post[] {
  return ((data ?? []) as PostRow[])
    .map(mapPostRow)
    .filter((post): post is Post => post !== null);
}

export type PaginatedPosts = {
  posts: PostSummaryWithThumbnail[];
  page: number;
  pageCount: number;
  total: number;
};

/** The public blog listing: published posts, newest first, 12 per page. */
export async function listPublishedPosts(page = 1): Promise<PaginatedPosts> {
  const supabase = await createSupabaseServerClient();
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const from = (safePage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const summaries = mapRows(data).map(toPostSummary);
  const total = count ?? summaries.length;
  const pageCount = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  return {
    posts: await attachThumbnails(summaries),
    page: safePage,
    pageCount,
    total,
  };
}

/** A single published Post by slug, or null. */
export async function getPublishedPostBySlug(
  slug: string,
): Promise<PostWithThumbnail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const post = data ? mapPostRow(data as PostRow) : null;
  if (!post) {
    return null;
  }

  const [withThumbnail] = await attachThumbnails([post]);
  return withThumbnail;
}

/** Every Post (drafts included) for the admin, most recently updated first. */
export async function listPosts(): Promise<PostSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return mapRows(data).map(toPostSummary);
}

/** A single Post by id (drafts included) for the admin editor. */
export async function getPostById(id: string): Promise<PostWithThumbnail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const post = data ? mapPostRow(data as PostRow) : null;
  if (!post) {
    return null;
  }

  const [withThumbnail] = await attachThumbnails([post]);
  return withThumbnail;
}

export type PostMutationResult =
  | { ok: true; post: Post }
  | { ok: false; error: string };

function friendlyError(message: string): string {
  if (/duplicate key|unique constraint/i.test(message)) {
    return "That slug is already used by another post. Choose a different slug.";
  }
  return message;
}

const SEO_COLUMNS = ["seo_title", "seo_description", "og_media_id"] as const;

function toPatch(input: PostInputValue): Record<string, unknown> {
  return {
    title: input.title,
    slug: input.slug,
    author: input.author,
    excerpt: input.excerpt,
    thumbnail_media_id: input.thumbnailMediaId,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    og_media_id: input.ogMediaId,
    body: input.body,
  };
}

/**
 * The SEO columns arrive with a migration. Until it is applied, keep Post
 * editing working by retrying without them (the values are simply not stored).
 */
function isMissingSeoColumns(error: {
  code?: string | null;
  message: string;
}): boolean {
  return (
    (error.code === "PGRST204" ||
      /seo_title|seo_description|og_media_id/.test(error.message)) &&
    /column|schema cache|does not exist/i.test(error.message)
  );
}

function withoutSeoColumns(
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const copy = { ...patch };
  for (const column of SEO_COLUMNS) {
    delete copy[column];
  }
  return copy;
}

/** Create a Post. New posts always start as a Draft. */
export async function createPost(
  input: PostInputValue,
  createdBy: string,
): Promise<PostMutationResult> {
  const supabase = await createSupabaseServerClient();
  const patch = {
    ...toPatch(input),
    status: "draft",
    created_by: createdBy,
  };
  let result = await supabase
    .from("posts")
    .insert(patch)
    .select("*")
    .single();

  if (result.error && isMissingSeoColumns(result.error)) {
    result = await supabase
      .from("posts")
      .insert(withoutSeoColumns(patch))
      .select("*")
      .single();
  }

  if (result.error) {
    return { ok: false, error: friendlyError(result.error.message) };
  }

  const post = mapPostRow(result.data as PostRow);
  return post
    ? { ok: true, post }
    : { ok: false, error: "The saved post could not be read." };
}

/** Update a Post's fields. Status is changed separately via `setPostStatus`. */
export async function updatePost(
  id: string,
  input: PostInputValue,
): Promise<PostMutationResult> {
  const supabase = await createSupabaseServerClient();
  const patch = toPatch(input);
  let result = await supabase
    .from("posts")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (result.error && isMissingSeoColumns(result.error)) {
    result = await supabase
      .from("posts")
      .update(withoutSeoColumns(patch))
      .eq("id", id)
      .select("*")
      .single();
  }

  if (result.error) {
    return { ok: false, error: friendlyError(result.error.message) };
  }

  const post = mapPostRow(result.data as PostRow);
  return post
    ? { ok: true, post }
    : { ok: false, error: "The updated post could not be read." };
}

/**
 * Publish a Post (sets `publishedAt`) or return it to Draft. No
 * scheduled/archived states (spec #2).
 */
export async function setPostStatus(
  id: string,
  status: PostStatus,
): Promise<PostMutationResult> {
  const supabase = await createSupabaseServerClient();
  const patch: Record<string, unknown> = {
    status,
    // Publishing stamps the date; unpublishing returns the Post to Draft and
    // clears it (spec #2: no scheduled/archived states).
    published_at: status === "published" ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("posts")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  const post = mapPostRow(data as PostRow);
  return post
    ? { ok: true, post }
    : { ok: false, error: "The updated post could not be read." };
}

/** Delete a Post (Admin-only via RLS). */
export async function deletePost(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

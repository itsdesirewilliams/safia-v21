"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin, requireMediaManager } from "@/lib/auth/session";
import type { PostActionState } from "@/lib/blog/action-state";
import { parsePostStatus, validatePostInput } from "@/lib/blog/post";
import {
  createPost,
  deletePost,
  setPostStatus,
  updatePost,
} from "@/lib/blog/server";

/**
 * Admin Post server actions (spec #2 / Ticket 9).
 *
 * Every action resolves authorization from the server session first
 * (`requireMediaManager` / `requireAdmin`); the database client is the
 * request-scoped session client, so Postgres RLS is the final authority on who
 * may read or write Posts. No action trusts a client-supplied role.
 */

const POSTS_PATH = "/admin/posts";

function readField(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value : null;
}

/** Create or update a Post's fields. Status is changed separately. */
export async function savePostAction(
  _previous: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const profile = await requireMediaManager();

  const postId = readField(formData, "postId");

  const validation = validatePostInput({
    title: readField(formData, "title"),
    slug: readField(formData, "slug"),
    author: readField(formData, "author"),
    excerpt: readField(formData, "excerpt"),
    thumbnailMediaId: readField(formData, "thumbnailMediaId"),
    body: readField(formData, "body"),
  });

  if (!validation.ok) {
    return {
      status: "error",
      message: Object.values(validation.errors)[0] ?? "Check the post details.",
    };
  }

  if (postId) {
    const result = await updatePost(postId, validation.value);
    if (!result.ok) {
      return { status: "error", message: result.error };
    }
    revalidatePath(POSTS_PATH);
    revalidatePath(`${POSTS_PATH}/${postId}/edit`);
    return { status: "success", message: "Post saved." };
  }

  const result = await createPost(validation.value, profile.id);
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  revalidatePath(POSTS_PATH);
  redirect(`${POSTS_PATH}/${result.post.id}/edit`);
}

/** Publish a Post or return it to Draft. */
export async function setPostStatusAction(
  _previous: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  await requireMediaManager();

  const postId = readField(formData, "postId");
  const status = parsePostStatus(readField(formData, "status"));

  if (!postId || !status) {
    return { status: "error", message: "Missing post or status." };
  }

  const result = await setPostStatus(postId, status);
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  revalidatePath(POSTS_PATH);
  revalidatePath(`${POSTS_PATH}/${postId}/edit`);
  revalidatePath("/blogs");
  revalidatePath(`/blogs/${result.post.slug}`);

  return {
    status: "success",
    message: status === "published" ? "Post published." : "Post returned to draft.",
  };
}

/** Delete a Post (Admin-only via RLS). */
export async function deletePostAction(
  _previous: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  await requireAdmin();

  const postId = readField(formData, "postId");
  if (!postId) {
    return { status: "error", message: "Missing post." };
  }

  const result = await deletePost(postId);
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  revalidatePath(POSTS_PATH);
  revalidatePath("/blogs");
  redirect(POSTS_PATH);
}

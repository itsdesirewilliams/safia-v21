"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canDeletePosts } from "@/lib/auth/roles";
import { requirePostsAccess } from "@/lib/auth/session";
import type { PostActionState } from "@/lib/blog/action-state";
import { parsePostStatus, validatePostInput } from "@/lib/blog/post";
import {
  createPost,
  deletePost,
  setPostStatus,
  updatePost,
} from "@/lib/blog/server";
import { uploadMedia } from "@/lib/media/server";
import { buildStoragePath, validateUpload } from "@/lib/media/upload";

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
  const profile = await requirePostsAccess();

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
  await requirePostsAccess();

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

/** Delete a Post (admin/operator only, enforced here and in RLS). */
export async function deletePostAction(
  _previous: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const profile = await requirePostsAccess();

  if (!canDeletePosts(profile.role)) {
    return {
      status: "error",
      message: "Only admins and operators can delete posts.",
    };
  }

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

/**
 * Upload an image for use in a post. Available to every post role (including
 * copywriter) and restricted to the `blog-images` bucket, which is the only
 * bucket a copywriter may write to (enforced again in RLS).
 */
export async function uploadBlogImageAction(
  _previous: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const profile = await requirePostsAccess();

  const fileEntry = formData.get("file");
  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    return { status: "error", message: "Choose an image to upload." };
  }

  const validation = validateUpload({
    fileName: fileEntry.name,
    mimeType: fileEntry.type,
    sizeBytes: fileEntry.size,
  });
  if (!validation.ok) {
    return { status: "error", message: validation.error };
  }
  if (validation.type !== "image") {
    return { status: "error", message: "Only images can be added to posts." };
  }

  const id = crypto.randomUUID();
  const path = buildStoragePath({
    safeName: validation.safeName,
    id,
    createdAt: new Date(),
    scope: "blog",
  });

  const result = await uploadMedia({
    bucket: "blog-images",
    path,
    type: "image",
    mimeType: fileEntry.type || null,
    file: fileEntry,
    metadata: {
      alt: null,
      caption: null,
      patternCode: null,
      categorySlug: null,
    },
    uploadedBy: profile.id,
  });

  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  revalidatePath(POSTS_PATH);
  revalidatePath("/admin/media");
  return { status: "success", message: "Image uploaded to the blog library." };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canDeletePosts } from "@/lib/auth/roles";
import { requirePostsAccess } from "@/lib/auth/session";
import type { PostActionState } from "@/lib/blog/action-state";
import type {
  BlogMediaUploadEntry,
  BlogMediaUploadResult,
  PostEditorPayload,
  PostSaveResult,
} from "@/lib/blog/editor";
import { validatePostInput } from "@/lib/blog/post";
import {
  createPost,
  deletePost,
  isSlugAvailable,
  setPostStatus,
  updatePost,
} from "@/lib/blog/server";
import { validateMediaMetadata } from "@/lib/media/metadata";
import {
  createMediaRecord,
  removeStorageObject,
  uploadMedia,
} from "@/lib/media/server";
import { buildStoragePath, validateUpload } from "@/lib/media/upload";
import {
  BLOG_IMAGE_MIME_TYPES,
  isSafeBlogMediaPath,
} from "@/lib/blog/upload-path";

/**
 * Admin Post server actions.
 *
 * Every action resolves authorization from the server session first
 * (`requirePostsAccess`); the database client is the request-scoped session
 * client, so Postgres RLS is the final authority on who may read or write
 * Posts. No action trusts a client-supplied role.
 */

const POSTS_PATH = "/admin/posts";

function readField(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value : null;
}

function toInput(payload: PostEditorPayload) {
  return {
    title: payload.title,
    slug: payload.slug,
    author: payload.author,
    excerpt: payload.excerpt,
    category: payload.category,
    thumbnailMediaId: payload.thumbnailMediaId,
    seoTitle: payload.seoTitle,
    seoDescription: payload.seoDescription,
    ogMediaId: payload.ogMediaId,
    body: payload.body,
  };
}

function firstError(errors: Record<string, string>): string {
  return Object.values(errors)[0] ?? "Check the post details.";
}

function revalidatePost(postId: string, slug: string, previousSlug?: string | null) {
  revalidatePath(POSTS_PATH);
  revalidatePath(`${POSTS_PATH}/${postId}/edit`);
  revalidatePath("/blogs");
  revalidatePath(`/blogs/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blogs/${previousSlug}`);
  }
  revalidatePath("/sitemap.xml");
}

/** Save without publishing. Drafts may be empty, including an empty title. */
export async function savePostDraftAction(
  payload: PostEditorPayload,
  postId?: string | null,
): Promise<PostSaveResult> {
  const profile = await requirePostsAccess();

  const validation = validatePostInput(toInput(payload), {
    requireTitle: false,
  });

  if (!validation.ok) {
    return {
      ok: false,
      message: firstError(validation.errors),
      errors: validation.errors,
    };
  }

  if (postId) {
    const result = await updatePost(postId, validation.value);
    if (!result.ok) {
      return { ok: false, message: result.error };
    }
    revalidatePost(postId, result.post.slug, payload.previousSlug);
    return {
      ok: true,
      postId,
      slug: result.post.slug,
      status: result.post.status,
      message: "Draft saved.",
    };
  }

  const result = await createPost(validation.value, profile.id, "draft");
  if (!result.ok) {
    return { ok: false, message: result.error };
  }

  revalidatePost(result.post.id, result.post.slug, payload.previousSlug);
  return {
    ok: true,
    postId: result.post.id,
    slug: result.post.slug,
    status: result.post.status,
    message: "Draft saved.",
  };
}

/** Save and publish (or update a published post). A title is required. */
export async function publishPostAction(
  payload: PostEditorPayload,
  postId?: string | null,
): Promise<PostSaveResult> {
  const profile = await requirePostsAccess();

  const validation = validatePostInput(toInput(payload), {
    requireTitle: true,
  });

  if (!validation.ok) {
    return {
      ok: false,
      message: firstError(validation.errors),
      errors: validation.errors,
    };
  }

  if (postId) {
    const updated = await updatePost(postId, validation.value);
    if (!updated.ok) {
      return { ok: false, message: updated.error };
    }
    // Re-publishing an already published post must not move its original
    // publication date; only a draft transitions to published.
    if (updated.post.status === "published") {
      revalidatePost(postId, updated.post.slug, payload.previousSlug);
      return {
        ok: true,
        postId,
        slug: updated.post.slug,
        status: "published",
        message: "Post updated.",
      };
    }

    const published = await setPostStatus(postId, "published");
    if (!published.ok) {
      return { ok: false, message: published.error };
    }
    revalidatePost(postId, published.post.slug, payload.previousSlug);
    return {
      ok: true,
      postId,
      slug: published.post.slug,
      status: "published",
      message: "Post published.",
    };
  }

  const result = await createPost(validation.value, profile.id, "published");
  if (!result.ok) {
    return { ok: false, message: result.error };
  }

  revalidatePost(result.post.id, result.post.slug, payload.previousSlug);
  return {
    ok: true,
    postId: result.post.id,
    slug: result.post.slug,
    status: "published",
    message: "Post published.",
  };
}

/** Return a published Post to Draft without deleting it. */
export async function unpublishPostAction(
  postId: string,
): Promise<PostSaveResult> {
  await requirePostsAccess();

  const result = await setPostStatus(postId, "draft");
  if (!result.ok) {
    return { ok: false, message: result.error };
  }

  revalidatePost(postId, result.post.slug);
  return {
    ok: true,
    postId,
    slug: result.post.slug,
    status: "draft",
    message: "Post returned to draft.",
  };
}

/** Lightweight uniqueness check used by the slug field. */
export async function checkSlugAction(
  slug: string,
  postId?: string | null,
): Promise<{ ok: true; available: boolean } | { ok: false; message: string }> {
  await requirePostsAccess();

  const value = slug.trim().toLowerCase();
  if (!value) {
    return { ok: true, available: true };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return { ok: false, message: "Use lowercase letters, numbers and dashes only." };
  }

  const result = await isSlugAvailable(value, postId);
  return result.ok
    ? { ok: true, available: result.available }
    : { ok: false, message: result.error };
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
  revalidatePath("/sitemap.xml");
  redirect(POSTS_PATH);
}

/**
 * Create the Media record after the block editor uploads directly to Storage.
 * The server validates the path, type and metadata; Storage RLS remains the
 * authority for the `blog-images` bucket. If the record cannot be created, the
 * just-uploaded object is removed so storage never accumulates orphans.
 */
export async function createBlogMediaRecordAction(
  entry: BlogMediaUploadEntry,
): Promise<BlogMediaUploadResult> {
  const profile = await requirePostsAccess();

  if (!isSafeBlogMediaPath(entry.path)) {
    return { ok: false, error: "The upload path was not valid." };
  }

  const fileName = entry.path.split("/").pop() ?? "image";
  const validation = validateUpload({
    fileName,
    mimeType: entry.mimeType,
    sizeBytes: entry.sizeBytes,
  });
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }
  if (
    validation.type !== "image" ||
    !BLOG_IMAGE_MIME_TYPES.includes(
      entry.mimeType as (typeof BLOG_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return { ok: false, error: "Use a JPG, PNG, WebP or AVIF image." };
  }

  const metadata = validateMediaMetadata({
    alt: entry.alt,
    caption: entry.caption,
  });
  if (!metadata.ok) {
    return {
      ok: false,
      error: Object.values(metadata.errors)[0] ?? "Check the image details.",
    };
  }

  const result = await createMediaRecord({
    bucket: "blog-images",
    path: entry.path,
    type: "image",
    mimeType: entry.mimeType,
    uploadedBy: profile.id,
    alt: metadata.value.alt,
    caption: metadata.value.caption,
  });

  if (!result.ok) {
    await removeStorageObject("blog-images", entry.path);
    return { ok: false, error: result.error };
  }

  revalidatePath("/admin/media");
  revalidatePath("/admin/files");
  revalidatePath(POSTS_PATH);
  return { ok: true, media: result.media };
}

/**
 * Upload an image for use in a post from the Posts list (the small quick-upload
 * form). The block editor uses the progress-capable upload route.
 *
 * Available to every post role (including copywriter) and restricted to the
 * `blog-images` bucket, which is the only bucket a copywriter may write to
 * (enforced again in RLS).
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

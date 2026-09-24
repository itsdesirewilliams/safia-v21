"use server";

import { revalidatePath } from "next/cache";

import { canManageAdminOnlyMedia } from "@/lib/auth/roles";
import { requireAdmin, requireMediaManager } from "@/lib/auth/session";
import type { MediaActionState } from "@/lib/media/action-state";
import { validateMediaMetadata } from "@/lib/media/metadata";
import {
  deleteMedia,
  getMediaById,
  setMediaHidden,
  updateMediaMetadata,
  uploadMedia,
} from "@/lib/media/server";
import { buildStoragePath, validateUpload } from "@/lib/media/upload";
import {
  isAdminOnlyBucket,
  isQualityFirstBucket,
  isStorageBucketId,
} from "@/lib/supabase/buckets";

/**
 * Admin media server actions (Ticket 4).
 *
 * Every action resolves authorization from the server session first
 * (`requireMediaManager` / `requireAdmin`); the storage and database clients
 * are the request-scoped session clients, so Supabase RLS is the final
 * authority. No action trusts a client-supplied role.
 */

const MEDIA_PATH = "/admin/media";

function readField(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" ? value : null;
}

export async function uploadMediaAction(
  _previous: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const profile = await requireMediaManager();

  const fileEntry = formData.get("file");
  const bucket = readField(formData, "bucket");

  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    return { status: "error", message: "Choose a file to upload." };
  }

  if (!bucket || !isStorageBucketId(bucket)) {
    return { status: "error", message: "Choose a valid storage bucket." };
  }

  if (isAdminOnlyBucket(bucket) && !canManageAdminOnlyMedia(profile.role)) {
    return {
      status: "error",
      message: "Gallery and Quality First media can only be managed by an admin.",
    };
  }

  const fileValidation = validateUpload({
    fileName: fileEntry.name,
    mimeType: fileEntry.type,
    sizeBytes: fileEntry.size,
  });

  if (!fileValidation.ok) {
    return { status: "error", message: fileValidation.error };
  }

  const metadata = validateMediaMetadata({
    alt: readField(formData, "alt"),
    caption: readField(formData, "caption"),
    patternCode: readField(formData, "patternCode"),
    categorySlug: readField(formData, "categorySlug"),
  });

  if (!metadata.ok) {
    return {
      status: "error",
      message: Object.values(metadata.errors)[0] ?? "Check the media details.",
    };
  }

  const id = crypto.randomUUID();
  const builtPath = buildStoragePath({
    safeName: fileValidation.safeName,
    id,
    createdAt: new Date(),
    scope: isQualityFirstBucket(bucket)
      ? null
      : (metadata.value.patternCode ?? metadata.value.categorySlug),
  });
  // Story videos live in the dedicated `stories` folder discovery reads
  // (spec #3); machine images stay in the bucket's year-month folders.
  const path = bucket === "testing-videos" ? `stories/${builtPath}` : builtPath;

  const result = await uploadMedia({
    bucket,
    path,
    type: fileValidation.type,
    mimeType: fileEntry.type || null,
    file: fileEntry,
    metadata: metadata.value,
    uploadedBy: profile.id,
  });

  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  revalidatePath(MEDIA_PATH);
  return {
    status: "success",
    message: `Uploaded ${result.media.caption ?? result.media.path}.`,
  };
}

export async function updateMediaAction(
  _previous: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const profile = await requireMediaManager();

  const mediaId = readField(formData, "mediaId");
  if (!mediaId) {
    return { status: "error", message: "Missing media id." };
  }

  const existing = await getMediaById(mediaId);
  if (
    existing &&
    isAdminOnlyBucket(existing.bucket) &&
    !canManageAdminOnlyMedia(profile.role)
  ) {
    return {
      status: "error",
      message: "Gallery and Quality First media can only be managed by an admin.",
    };
  }

  const metadata = validateMediaMetadata({
    alt: readField(formData, "alt"),
    caption: readField(formData, "caption"),
    patternCode: readField(formData, "patternCode"),
    categorySlug: readField(formData, "categorySlug"),
  });

  if (!metadata.ok) {
    return {
      status: "error",
      message: Object.values(metadata.errors)[0] ?? "Check the media details.",
    };
  }

  const result = await updateMediaMetadata(mediaId, metadata.value);
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  revalidatePath(MEDIA_PATH);
  return { status: "success", message: "Media details updated." };
}

export async function deleteMediaAction(
  _previous: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  await requireAdmin();

  const mediaId = readField(formData, "mediaId");
  if (!mediaId) {
    return { status: "error", message: "Missing media id." };
  }

  const result = await deleteMedia(mediaId);
  if (!result.ok) {
    return {
      status: "error",
      message: result.blocked ? result.reason : result.error,
    };
  }

  revalidatePath(MEDIA_PATH);
  return { status: "success", message: "Media deleted." };
}

/**
 * Hide or reveal a media item (Admin-only). Hiding removes it from public
 * discovery without deleting the file (spec #3).
 */
export async function setMediaHiddenAction(
  _previous: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  await requireAdmin();

  const mediaId = readField(formData, "mediaId");
  if (!mediaId) {
    return { status: "error", message: "Missing media id." };
  }

  const hidden = readField(formData, "hidden") === "true";
  const result = await setMediaHidden(mediaId, hidden);
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  revalidatePath(MEDIA_PATH);
  return {
    status: "success",
    message: hidden ? "Media hidden from the public page." : "Media revealed.",
  };
}

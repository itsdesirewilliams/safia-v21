"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canManageAdminOnlyMedia } from "@/lib/auth/roles";
import { requireMediaManager } from "@/lib/auth/session";
import type { MediaActionState } from "@/lib/media/action-state";
import { findFileCategory } from "@/lib/media/categories";
import {
  GALLERY_BATCH_MAX,
  GALLERY_BUCKET_ID,
  isSafeGalleryPath,
  type GalleryBatchEntry,
  type GalleryBatchResult,
} from "@/lib/media/gallery-batch";
import { findNextMissingCaptionId } from "@/lib/media/library";
import { CAPTION_MAX_LENGTH, validateMediaMetadata } from "@/lib/media/metadata";
import {
  createMediaRecord,
  deleteMedia,
  getMediaById,
  setMediaHidden,
  updateMediaCaption,
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
 * Admin File Manager server actions.
 *
 * Every action resolves authorization from the server session first
 * (`requireMediaManager` / `requireAdmin`); the storage and database clients are
 * the request-scoped session clients, so Supabase RLS is the final authority.
 * No action trusts a client-supplied role.
 */

const FILES_PATH = "/admin/media";
const CAPTIONS_PATH = "/admin/files/captions";

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

  revalidatePath(FILES_PATH);
  return {
    status: "success",
    message: `Uploaded ${result.media.caption ?? result.media.path}.`,
  };
}

/**
 * Create Media records for objects the browser already uploaded to the Gallery
 * bucket (bulk upload). Admin-only, matching the Gallery RLS. Each entry is
 * validated independently so one failure never cancels the batch.
 */
export async function createGalleryRecordsAction(
  entries: GalleryBatchEntry[],
): Promise<GalleryBatchResult> {
  const profile = await requireMediaManager();

  const list = Array.isArray(entries)
    ? entries.slice(0, GALLERY_BATCH_MAX)
    : [];
  const failures: GalleryBatchResult["failures"] = [];
  let created = 0;

  for (const entry of list) {
    const name = typeof entry?.name === "string" ? entry.name : "file";

    if (!entry || !isSafeGalleryPath(entry.path)) {
      failures.push({ name, error: "The upload path was not valid." });
      continue;
    }

    const validation = validateUpload({
      fileName: name,
      mimeType: entry.mimeType,
      sizeBytes: entry.sizeBytes,
    });

    if (!validation.ok) {
      failures.push({ name, error: validation.error });
      continue;
    }

    if (validation.type !== "image") {
      failures.push({ name, error: "Only images can be added to the Gallery." });
      continue;
    }

    const result = await createMediaRecord({
      bucket: GALLERY_BUCKET_ID,
      path: entry.path,
      type: "image",
      mimeType: entry.mimeType,
      uploadedBy: profile.id,
    });

    if (!result.ok) {
      failures.push({ name, error: result.error });
      continue;
    }

    created += 1;
  }

  revalidatePath(FILES_PATH);
  revalidatePath(CAPTIONS_PATH);
  return { created, failures };
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

  revalidatePath(FILES_PATH);
  return { status: "success", message: "Media details updated." };
}

export async function deleteMediaAction(
  _previous: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  await requireMediaManager();

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

  revalidatePath(FILES_PATH);
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
  await requireMediaManager();

  const mediaId = readField(formData, "mediaId");
  if (!mediaId) {
    return { status: "error", message: "Missing media id." };
  }

  const hidden = readField(formData, "hidden") === "true";
  const result = await setMediaHidden(mediaId, hidden);
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  revalidatePath(FILES_PATH);
  return {
    status: "success",
    message: hidden ? "Media hidden from the public page." : "Media revealed.",
  };
}

export type CaptionActionState = {
  status: "idle" | "error";
  message?: string;
};

/**
 * Save a caption and move straight to the next image that still needs one, so
 * the workflow never bounces back to a list between captions (spec: caption
 * management).
 */
export async function saveCaptionAction(
  _previous: CaptionActionState,
  formData: FormData,
): Promise<CaptionActionState> {
  const profile = await requireMediaManager();

  const mediaId = readField(formData, "mediaId");
  const categoryId = readField(formData, "category") ?? "gallery";

  if (!mediaId) {
    return { status: "error", message: "Missing media id." };
  }

  const caption = (readField(formData, "caption") ?? "").trim();
  if (caption.length > CAPTION_MAX_LENGTH) {
    return {
      status: "error",
      message: `Caption must be ${CAPTION_MAX_LENGTH} characters or fewer.`,
    };
  }

  const existing = await getMediaById(mediaId);
  if (!existing) {
    return { status: "error", message: "That image no longer exists." };
  }

  if (
    isAdminOnlyBucket(existing.bucket) &&
    !canManageAdminOnlyMedia(profile.role)
  ) {
    return {
      status: "error",
      message: "Gallery and Quality First captions can only be managed by an admin.",
    };
  }

  const result = await updateMediaCaption(
    mediaId,
    caption === "" ? null : caption,
  );
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  revalidatePath(FILES_PATH);
  revalidatePath(CAPTIONS_PATH);

  const category = findFileCategory(categoryId);
  const nextId = await findNextMissingCaptionId(
    { buckets: category.buckets },
    mediaId,
  );

  const params = new URLSearchParams({
    category: category.id,
    filter: "missing",
  });
  if (nextId) {
    params.set("id", nextId);
  } else {
    params.set("done", "1");
  }

  redirect(`${CAPTIONS_PATH}?${params.toString()}`);
}

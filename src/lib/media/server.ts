import { getSupabaseUrl } from "@/lib/config";
import {
  bucketAcceptsType,
  isStorageBucketId,
  type StorageBucketId,
} from "@/lib/supabase/buckets";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  evaluateMediaDeletion,
  mapMediaReferences,
  type DeletionDecision,
  type MediaReference,
} from "./deletion";
import type { MediaMetadataValue } from "./metadata";
import {
  mapMediaRow,
  sanitizeSearchTerm,
  type MediaRow,
} from "./record";
import { isMediaType, type Media, type MediaType } from "./types";

/**
 * Server data access for the shared Media layer (Ticket 4).
 *
 * Every call uses the request's Supabase session client, so Postgres RLS — not
 * this code — is the authority on who may read, insert, update or delete. The
 * functions here validate and map; they never bypass RLS with the service role.
 */

export type MediaListFilters = {
  bucket?: string | null;
  type?: string | null;
  search?: string | null;
  limit?: number;
};

/** List media newest-first with optional bucket/type/search filters. */
export async function listMedia(
  filters: MediaListFilters = {},
): Promise<Media[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(filters.limit ?? 120, 1), 240));

  if (filters.bucket && isStorageBucketId(filters.bucket)) {
    query = query.eq("bucket", filters.bucket);
  }

  if (filters.type && isMediaType(filters.type)) {
    query = query.eq("type", filters.type);
  }

  if (filters.search) {
    const term = sanitizeSearchTerm(filters.search);
    if (term) {
      query = query.or(
        [
          `caption.ilike.%${term}%`,
          `alt.ilike.%${term}%`,
          `pattern_code.ilike.%${term}%`,
          `storage_path.ilike.%${term}%`,
        ].join(","),
      );
    }
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const supabaseUrl = getSupabaseUrl();
  return ((data ?? []) as MediaRow[])
    .map((row) => mapMediaRow(row, supabaseUrl))
    .filter((media): media is Media => media !== null);
}

export async function getMediaById(id: string): Promise<Media | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapMediaRow(data as MediaRow, getSupabaseUrl()) : null;
}

/** Resolve several Media records by id; missing ids are simply omitted. */
export async function getMediaByIds(ids: readonly string[]): Promise<Media[]> {
  const unique = [...new Set(ids.filter((id) => id !== ""))];
  if (unique.length === 0) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .in("id", unique);

  if (error) {
    throw new Error(error.message);
  }

  const supabaseUrl = getSupabaseUrl();
  return ((data ?? []) as MediaRow[])
    .map((row) => mapMediaRow(row, supabaseUrl))
    .filter((media): media is Media => media !== null);
}

/** References that block deletion, resolved by the database. */
export async function listMediaReferences(
  mediaId: string,
): Promise<MediaReference[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("media_references", {
    p_media_id: mediaId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return mapMediaReferences(data);
}

export type UploadMediaInput = {
  bucket: StorageBucketId;
  path: string;
  type: MediaType;
  mimeType: string | null;
  file: Blob;
  metadata: MediaMetadataValue;
  uploadedBy: string;
};

export type UploadResult =
  | { ok: true; media: Media }
  | { ok: false; error: string };

/**
 * Upload the object and create its Media record. If the record cannot be
 * created, the just-uploaded object is removed so storage never accumulates
 * orphans.
 */
export async function uploadMedia(input: UploadMediaInput): Promise<UploadResult> {
  if (!bucketAcceptsType(input.bucket, input.type)) {
    return {
      ok: false,
      error: `The "${input.bucket}" bucket does not accept ${input.type} files.`,
    };
  }

  const supabase = await createSupabaseServerClient();

  const upload = await supabase.storage
    .from(input.bucket)
    .upload(input.path, input.file, {
      contentType: input.mimeType ?? undefined,
      upsert: false,
    });

  if (upload.error) {
    return { ok: false, error: `Upload failed: ${upload.error.message}` };
  }

  const { data, error } = await supabase
    .from("media")
    .insert({
      bucket: input.bucket,
      storage_path: input.path,
      type: input.type,
      mime_type: input.mimeType,
      alt: input.metadata.alt,
      caption: input.metadata.caption,
      pattern_code: input.metadata.patternCode,
      category_slug: input.metadata.categorySlug,
      uploaded_by: input.uploadedBy,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(input.bucket).remove([input.path]);
    return {
      ok: false,
      error: `Could not save the media record: ${error.message}`,
    };
  }

  const media = mapMediaRow(data as MediaRow, getSupabaseUrl());
  if (!media) {
    return { ok: false, error: "The saved media record could not be read." };
  }

  return { ok: true, media };
}

export async function updateMediaMetadata(
  id: string,
  metadata: MediaMetadataValue,
): Promise<{ ok: true; media: Media } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media")
    .update({
      alt: metadata.alt,
      caption: metadata.caption,
      pattern_code: metadata.patternCode,
      category_slug: metadata.categorySlug,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: `Could not update the media record: ${error.message}` };
  }

  const media = mapMediaRow(data as MediaRow, getSupabaseUrl());
  if (!media) {
    return { ok: false, error: "The updated media record could not be read." };
  }

  return { ok: true, media };
}

/**
 * Hide or reveal a Media record without deleting its file. Hiding is enforced
 * at discovery time, so the public page simply stops listing the item.
 */
export async function setMediaHidden(
  id: string,
  hidden: boolean,
): Promise<{ ok: true; media: Media } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media")
    .update({ hidden })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return {
      ok: false,
      error: `Could not ${hidden ? "hide" : "reveal"} the media: ${error.message}`,
    };
  }

  const media = mapMediaRow(data as MediaRow, getSupabaseUrl());
  if (!media) {
    return { ok: false, error: "The updated media record could not be read." };
  }

  return { ok: true, media };
}

export type DeleteResult =
  | { ok: true; media: Media }
  | { ok: false; blocked: true; reason: string; references: MediaReference[] }
  | { ok: false; blocked: false; error: string };

/**
 * Delete a Media record. The row is deleted first so the reference-protection
 * trigger runs before the storage object is touched; only then is the object
 * removed. A referenced record is never deleted.
 */
export async function deleteMedia(id: string): Promise<DeleteResult> {
  const media = await getMediaById(id);
  if (!media) {
    return { ok: false, blocked: false, error: "That media no longer exists." };
  }

  const references = await listMediaReferences(id);
  const decision: DeletionDecision = evaluateMediaDeletion(references);
  if (!decision.allowed) {
    return {
      ok: false,
      blocked: true,
      reason: decision.reason ?? "This media is still referenced.",
      references,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("media").delete().eq("id", id);

  if (error) {
    // The reference scan can race a newly-created reference, so re-check
    // through the shared decision seam rather than parsing the trigger's
    // message.
    const referencesAfterFailure = await listMediaReferences(id);
    const retryDecision = evaluateMediaDeletion(referencesAfterFailure);
    if (!retryDecision.allowed) {
      return {
        ok: false,
        blocked: true,
        reason:
          retryDecision.reason ??
          "This media is still referenced. Remove the reference before deleting.",
        references: referencesAfterFailure,
      };
    }
    return { ok: false, blocked: false, error: error.message };
  }

  await supabase.storage.from(media.bucket).remove([media.path]);

  return { ok: true, media };
}

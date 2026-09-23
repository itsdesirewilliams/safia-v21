import { isStorageBucketId } from "@/lib/supabase/buckets";

import { isMediaType, type Media } from "./types";
import { resolveMediaPublicUrl } from "./url";

/**
 * Pure mapping between the `public.media` row shape and the resolved Media
 * asset. Kept free of server-only imports so it can be tested directly.
 */

export type MediaRow = {
  id: string;
  bucket: string;
  storage_path: string;
  type: string;
  mime_type: string | null;
  alt: string | null;
  caption: string | null;
  pattern_code: string | null;
  category_slug: string | null;
  uploaded_by: string | null;
  created_at: string;
};

/** Map a database row to a resolved Media asset; null when malformed. */
export function mapMediaRow(
  row: MediaRow,
  supabaseUrl: string,
): Media | null {
  if (!isStorageBucketId(row.bucket) || !isMediaType(row.type)) {
    return null;
  }

  return {
    id: row.id,
    bucket: row.bucket,
    path: row.storage_path,
    url: resolveMediaPublicUrl(supabaseUrl, row.bucket, row.storage_path),
    type: row.type,
    mimeType: row.mime_type,
    alt: row.alt,
    caption: row.caption,
    patternCode: row.pattern_code,
    categorySlug: row.category_slug,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  };
}

/** Turn free text into a safe PostgREST ILIKE term. */
export function sanitizeSearchTerm(raw: string): string {
  return raw
    .trim()
    .replace(/[^A-Za-z0-9 -]/g, "")
    .replace(/\s+/g, "%");
}

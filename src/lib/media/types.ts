import type { StorageBucketId } from "@/lib/supabase/buckets";

/**
 * The shared Media layer vocabulary (spec #2 / Ticket 4).
 *
 * A Media record is stored in Supabase Storage (bucket + object path) with the
 * metadata needed to render it. It may optionally be associated with a
 * catalogue Pattern (`patternCode`) or Category (`categorySlug`); those
 * associations power product pages only — the Gallery does not consume them.
 */

export const MEDIA_TYPES = ["image", "video", "document"] as const;

export type MediaType = (typeof MEDIA_TYPES)[number];

export function isMediaType(value: unknown): value is MediaType {
  return (
    typeof value === "string" &&
    (MEDIA_TYPES as readonly string[]).includes(value)
  );
}

/** A resolved Media record, as consumed by public and admin surfaces. */
export type Media = {
  id: string;
  bucket: StorageBucketId;
  /** Object key within the bucket (no leading slash). */
  path: string;
  /** Public URL resolved through the shared media layer. */
  url: string;
  type: MediaType;
  mimeType: string | null;
  alt: string | null;
  caption: string | null;
  patternCode: string | null;
  categorySlug: string | null;
  uploadedBy: string | null;
  createdAt: string;
};

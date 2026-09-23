import type { MediaType } from "@/lib/media/types";

/**
 * The six storage buckets provisioned for the site (spec #10 / #2).
 * `public: true` means anonymous read; write access is governed by storage
 * RLS policies created by the Media-layer ticket.
 */
export const STORAGE_BUCKETS = [
  { id: "product-images", public: true },
  { id: "blog-images", public: true },
  { id: "gallery", public: true },
  { id: "testing-videos", public: true },
  { id: "machine-images", public: true },
  { id: "catalogue-pdfs", public: true },
] as const;

export type StorageBucketId = (typeof STORAGE_BUCKETS)[number]["id"];

export const STORAGE_BUCKET_IDS: readonly StorageBucketId[] =
  STORAGE_BUCKETS.map((bucket) => bucket.id);

export function isStorageBucketId(value: unknown): value is StorageBucketId {
  return (
    typeof value === "string" &&
    (STORAGE_BUCKET_IDS as readonly string[]).includes(value)
  );
}

/**
 * Which media types each bucket accepts. Keeps storage organised: a bucket is
 * for one purpose, so the admin cannot drop a PDF into the gallery.
 */
export const BUCKET_ACCEPTS: Record<StorageBucketId, readonly MediaType[]> = {
  "product-images": ["image"],
  "blog-images": ["image", "video", "document"],
  gallery: ["image", "video"],
  "testing-videos": ["video"],
  "machine-images": ["image"],
  "catalogue-pdfs": ["document"],
};

export function bucketAcceptsType(
  bucket: StorageBucketId,
  type: MediaType,
): boolean {
  return BUCKET_ACCEPTS[bucket].includes(type);
}

/** The buckets the public site reads from. All six are public-read. */
export const PUBLIC_BUCKETS: readonly StorageBucketId[] = STORAGE_BUCKET_IDS;

/**
 * Buckets whose contents belong to the Quality First page (spec #3). They are
 * managed by Admins only — Editors have no access, since the testing footage
 * and machine imagery is brand-sensitive.
 */
export const QUALITY_FIRST_BUCKET_IDS = [
  "testing-videos",
  "machine-images",
] as const satisfies readonly StorageBucketId[];

export function isQualityFirstBucket(
  bucket: StorageBucketId,
): boolean {
  return (QUALITY_FIRST_BUCKET_IDS as readonly string[]).includes(bucket);
}

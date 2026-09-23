/**
 * The six storage buckets provisioned for the site (spec #10 / #2).
 * `public: true` means anonymous read; write access is governed by storage
 * RLS policies owned by the Media-layer ticket.
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

export const STORAGE_BUCKET_IDS: readonly string[] = STORAGE_BUCKETS.map(
  (bucket) => bucket.id,
);

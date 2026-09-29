/**
 * Contract for the Gallery bulk upload. The browser uploads each image straight
 * to Supabase Storage (avoiding the Next server-action body limit), then asks
 * the server to create the Media records. These pure helpers are shared by the
 * client uploader and the server action.
 */

/** The bucket that backs the public Gallery. */
export const GALLERY_BUCKET_ID = "gallery" as const;

/** How many files may be uploaded in one batch. */
export const GALLERY_BATCH_MAX = 100;

/** The `accept` hint for the Gallery bulk input. */
export const GALLERY_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif" as const;

/** A single successfully-uploaded object awaiting its Media record. */
export type GalleryBatchEntry = {
  name: string;
  path: string;
  mimeType: string;
  sizeBytes: number;
};

export type GalleryBatchFailure = {
  name: string;
  error: string;
};

export type GalleryBatchResult = {
  created: number;
  failures: GalleryBatchFailure[];
};

/**
 * A safe bucket-relative object key for a bulk-uploaded Gallery image:
 * `YYYY-MM/<uuid>-<safe-name>`. Rejects traversal and stray folders.
 */
export function isSafeGalleryPath(path: string): boolean {
  return /^\d{4}-\d{2}\/[A-Za-z0-9._-]+$/.test(path);
}

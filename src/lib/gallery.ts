/**
 * Developer-owned Gallery page copy (spec #7 / Ticket #21).
 *
 * The Gallery is a storage-discovery page: images appear because they are
 * present in the `gallery` bucket, and an optional Media record supplies their
 * caption and alt text. This module holds only the static page copy and the
 * small index helper the viewer uses; it has no admin surface.
 */

export const GALLERY_PAGE = {
  eyebrow: "Gallery",
  title: "Gallery",
  description:
    "A look at Safeway Tyre — the ranges we make and the places they run. Select any image to view it larger.",
} as const;

export const GALLERY_EMPTY_STATE = {
  label: "Gallery images not supplied",
  detail:
    "No images have been added to the gallery bucket yet. Upload images from /admin/media (Admins only) to populate this grid — no code change is required.",
} as const;

/**
 * Wrap an index into `0..count-1` so viewer next/previous stays bound to the
 * sequence. Returns 0 for an empty sequence.
 */
export function wrapIndex(index: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  return ((index % count) + count) % count;
}

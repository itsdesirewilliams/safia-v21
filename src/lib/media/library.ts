import {
  countMedia,
  hasMissingCaption,
  listMedia,
  type MediaCountFilters,
  type MediaListFilters,
} from "./server";
import { listStorageObjects } from "./storage-list";
import type { Media } from "./types";

/**
 * Admin File Manager data access. Wraps the shared Media layer and adds
 * best-effort storage metadata (object size) for display. No new table or
 * bucket: size is read from the storage listing, not stored on the record.
 */

export type LibraryFile = Media & { sizeBytes: number | null };

/** List media with storage sizes attached where the listing reports them. */
export async function listMediaWithSizes(
  filters: MediaListFilters = {},
): Promise<LibraryFile[]> {
  const media = await listMedia(filters);

  if (media.length === 0) {
    return [];
  }

  const buckets = [...new Set(media.map((item) => item.bucket))];
  const sizes = new Map<string, number>();

  await Promise.all(
    buckets.map(async (bucket) => {
      try {
        const files = await listStorageObjects(bucket);
        for (const file of files) {
          if (file.sizeBytes !== null) {
            sizes.set(`${bucket}/${file.path}`, file.sizeBytes);
          }
        }
      } catch {
        // Size is best-effort; the file still lists without it.
      }
    }),
  );

  return media.map((item) => ({
    ...item,
    sizeBytes: sizes.get(`${item.bucket}/${item.path}`) ?? null,
  }));
}

export { countMedia };
export type { MediaCountFilters, MediaListFilters };

/**
 * The next image (in upload order) needing a caption within the given buckets,
 * after `currentId`. Powers the "save and move on" caption workflow; returns
 * `null` when every image has a caption.
 */
export async function findNextMissingCaptionId(
  filters: MediaListFilters,
  currentId: string | null,
): Promise<string | null> {
  const images = await listMedia({
    ...filters,
    type: "image",
    caption: "missing",
    limit: 240,
  });

  const ordered = [...images].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  if (ordered.length === 0) {
    return null;
  }

  const currentIndex = currentId
    ? ordered.findIndex((item) => item.id === currentId)
    : -1;

  if (currentIndex === -1) {
    return ordered[0].id;
  }

  const remaining = ordered
    .slice(currentIndex + 1)
    .filter((item) => item.id !== currentId);

  return remaining[0]?.id ?? null;
}

/** Count of image media with no caption across the given filters. */
export async function countMissingCaptions(
  filters: Omit<MediaCountFilters, "caption" | "type"> = {},
): Promise<number> {
  return countMedia({ ...filters, type: "image", caption: "missing" });
}

export { hasMissingCaption };


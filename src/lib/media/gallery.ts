/**
 * Gallery image discovery (spec #7 / Ticket #21).
 *
 * The Gallery follows the storage-discovery principle recorded in ADR-0006 for
 * Quality First, but is a distinct, simpler domain: images appear because they
 * are present in the `gallery` bucket, ordered newest first by storage object
 * creation time. An optional Media record (keyed by storage path) supplies the
 * caption and alt text; absent a record, the caption defaults to "Safeway
 * Tyre" so the viewer never looks broken.
 *
 * This module is the pure discovery seam: given a storage listing and optional
 * Media metadata, it returns the supported, ordered image set. It never touches
 * the network or the filesystem, so the ordering / whitelist / caption rules
 * are tested directly.
 */

import type { StorageObjectFile } from "./storage-list";

/** The storage bucket that backs the Gallery. */
export const GALLERY_BUCKET = "gallery";

/** The caption shown when an image has no Media record (also in development). */
export const DEFAULT_GALLERY_CAPTION = "Safeway Tyre";

/** Image formats treated as gallery images. Unsupported files are ignored. */
export const GALLERY_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
] as const;

/** A file discovered in the gallery bucket listing. */
export type GalleryFile = StorageObjectFile;

/**
 * Optional metadata attached to a discovered file by a Media record. Only
 * caption and alt are Gallery requirements; their absence never prevents
 * display.
 */
export type GalleryMetadata = {
  path: string;
  caption: string | null;
  alt: string | null;
};

/** A gallery image resolved for the grid/viewer (URL is added by the server layer). */
export type GalleryImage = {
  path: string;
  url: string;
  /** Never null: falls back to the default caption. */
  caption: string;
  /** Never null: falls back to the caption. */
  alt: string;
  createdAt: string;
};

function extensionOf(path: string): string {
  const name = path.split("/").pop() ?? path;
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot).toLowerCase() : "";
}

/** A whitelisted gallery image. */
export function isGalleryImage(path: string): boolean {
  const extension = extensionOf(path);
  return (
    extension !== "" &&
    (GALLERY_IMAGE_EXTENSIONS as readonly string[]).includes(extension)
  );
}

function metadataByPath(
  metadata: readonly GalleryMetadata[] | undefined,
): Map<string, GalleryMetadata> {
  const map = new Map<string, GalleryMetadata>();
  for (const entry of metadata ?? []) {
    map.set(entry.path, entry);
  }
  return map;
}

function trimmed(value: string | null | undefined): string | null {
  const result = value?.trim();
  return result ? result : null;
}

export type DiscoverGalleryImagesInput = {
  files: readonly GalleryFile[];
  metadata?: readonly GalleryMetadata[];
};

/**
 * Discover the supported, newest-first gallery images. Unsupported file types
 * are ignored; the caption defaults to "Safeway Tyre" and alt falls back to the
 * caption when the Media record is missing or blank.
 */
export function discoverGalleryImages({
  files,
  metadata,
}: DiscoverGalleryImagesInput): GalleryImage[] {
  const byPath = metadataByPath(metadata);

  return files
    .filter((file) => isGalleryImage(file.path))
    .slice()
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) ||
        a.path.localeCompare(b.path),
    )
    .map((file) => {
      const meta = byPath.get(file.path);
      const caption = trimmed(meta?.caption) ?? DEFAULT_GALLERY_CAPTION;
      const alt = trimmed(meta?.alt) ?? caption;
      return {
        path: file.path,
        url: "",
        caption,
        alt,
        createdAt: file.createdAt,
      };
    });
}

import { naturalCompare } from "@/lib/natural-order";

/**
 * Quality First media discovery (spec #3 / Ticket 5, ADR-0006).
 *
 * The page's story videos and machine images are discovered from Supabase
 * Storage at read time; presence is the source of truth and no database record
 * is required for an item to appear. This module is the pure discovery seam:
 * given a storage listing (paths) and optional Media metadata, it returns the
 * supported, ordered, visible set. It never touches the network or the
 * filesystem, so the ordering / whitelist / hide rules are tested directly.
 */

/** The dedicated folder inside the `testing-videos` bucket. */
export const STORY_FOLDER = "stories";

/** Storage bucket for testing story videos. */
export const STORY_BUCKET = "testing-videos";

/** Storage bucket for testing machine images. */
export const MACHINE_BUCKET = "machine-images";

/** Video formats treated as stories. Unsupported files are ignored. */
export const STORY_VIDEO_EXTENSIONS = [".mp4", ".webm"] as const;

/** Image formats accepted as story posters. */
export const STORY_POSTER_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
] as const;

/** Image formats treated as machine images. Unsupported files are ignored. */
export const MACHINE_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
] as const;

/** A file discovered in a storage bucket listing. */
export type StorageFile = {
  /** Bucket-relative object key, no leading slash. */
  path: string;
};

/**
 * Optional metadata attached to a discovered file by a Media record. Its
 * absence must never prevent display; only `hidden` changes what is shown.
 */
export type QualityFirstMetadata = {
  path: string;
  hidden: boolean;
  alt: string | null;
  caption: string | null;
};

/** A story video resolved for the rail (URLs are added by the server layer). */
export type QualityFirstStory = {
  path: string;
  url: string;
  posterUrl: string | null;
  title: string | null;
  alt: string | null;
  caption: string | null;
};

/** A machine image resolved for the masonry. */
export type QualityFirstMachineImage = {
  path: string;
  url: string;
  alt: string | null;
  caption: string | null;
};

export type DiscoveredStory = {
  path: string;
  posterPath: string | null;
  title: string | null;
  alt: string | null;
  caption: string | null;
};

export type DiscoveredMachineImage = {
  path: string;
  alt: string | null;
  caption: string | null;
};

function extensionOf(path: string): string {
  const name = path.split("/").pop() ?? path;
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot).toLowerCase() : "";
}

function isExtensionIn(path: string, extensions: readonly string[]): boolean {
  const extension = extensionOf(path);
  return extension !== "" && extensions.includes(extension);
}

/** A whitelisted story video (`.mp4` / `.webm`). */
export function isStoryVideo(path: string): boolean {
  return isExtensionIn(path, STORY_VIDEO_EXTENSIONS);
}

/** A whitelisted story poster image. */
export function isStoryPoster(path: string): boolean {
  return isExtensionIn(path, STORY_POSTER_EXTENSIONS);
}

/** A whitelisted machine image. */
export function isMachineImage(path: string): boolean {
  return isExtensionIn(path, MACHINE_IMAGE_EXTENSIONS);
}

function normalizeFolder(folder: string): string {
  return folder.endsWith("/") ? folder : `${folder}/`;
}

function metadataByPath(
  metadata: readonly QualityFirstMetadata[] | undefined,
): Map<string, QualityFirstMetadata> {
  const map = new Map<string, QualityFirstMetadata>();
  for (const entry of metadata ?? []) {
    map.set(entry.path, entry);
  }
  return map;
}

function directoryOf(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? "" : path.slice(0, slash);
}

/** The sibling image in the same folder sharing a video's stem. */
export function findStoryPoster(
  videoPath: string,
  files: readonly StorageFile[],
): string | null {
  const stem = videoPath.slice(0, videoPath.length - extensionOf(videoPath).length);
  const folder = directoryOf(videoPath);
  const candidates = files
    .map((file) => file.path)
    .filter(
      (path) =>
        directoryOf(path) === folder &&
        isStoryPoster(path) &&
        path.slice(0, path.length - extensionOf(path).length) === stem,
    )
    .sort(naturalCompare);

  return candidates[0] ?? null;
}

export type DiscoverStoriesInput = {
  files: readonly StorageFile[];
  metadata?: readonly QualityFirstMetadata[];
};

/**
 * Discover the visible, supported, naturally-ordered stories under the
 * dedicated `stories` folder. Unsupported file types are ignored, hidden items
 * are excluded, and videos outside the folder are never rendered.
 */
export function discoverStories({
  files,
  metadata,
}: DiscoverStoriesInput): DiscoveredStory[] {
  const prefix = normalizeFolder(STORY_FOLDER);
  const byPath = metadataByPath(metadata);

  return files
    .map((file) => file.path)
    .filter((path) => path.startsWith(prefix) && isStoryVideo(path))
    .filter((path) => byPath.get(path)?.hidden !== true)
    .sort(naturalCompare)
    .map((path) => {
      const meta = byPath.get(path);
      return {
        path,
        posterPath: findStoryPoster(path, files),
        title: meta?.caption ?? null,
        alt: meta?.alt ?? null,
        caption: meta?.caption ?? null,
      };
    });
}

export type DiscoverMachineImagesInput = {
  files: readonly StorageFile[];
  metadata?: readonly QualityFirstMetadata[];
};

/**
 * Discover the visible, supported, naturally-ordered machine images. Any path
 * in the `machine-images` bucket may be an image; unsupported types are
 * ignored and hidden items excluded.
 */
export function discoverMachineImages({
  files,
  metadata,
}: DiscoverMachineImagesInput): DiscoveredMachineImage[] {
  const byPath = metadataByPath(metadata);

  return files
    .map((file) => file.path)
    .filter(isMachineImage)
    .filter((path) => byPath.get(path)?.hidden !== true)
    .sort(naturalCompare)
    .map((path) => {
      const meta = byPath.get(path);
      return {
        path,
        alt: meta?.alt ?? null,
        caption: meta?.caption ?? null,
      };
    });
}

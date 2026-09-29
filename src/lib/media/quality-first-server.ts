import { getSupabaseUrl } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  discoverMachineImages,
  discoverStories,
  MACHINE_BUCKET,
  STORY_BUCKET,
  type QualityFirstMachineImage,
  type QualityFirstMetadata,
  type QualityFirstStory,
  type StorageFile,
} from "./quality-first";
import {
  localMachineUrl,
  localStoryUrl,
  readLocalMachineFiles,
  readLocalStoryFiles,
} from "./quality-first-assets";
import { listStorageObjects } from "./storage-list";
import { resolveMediaPublicUrl } from "./url";

/**
 * Server-side Quality First media discovery (spec #3 / Ticket 5, ADR-0006).
 *
 * Two sources feed the page, merged at read time:
 *  - developer-provided assets under `public/assets/testing-videos/stories`
 *    and `public/assets/machine-images` (the primary source for supplied media);
 *  - Supabase Storage objects in the `testing-videos` / `machine-images`
 *    buckets (admin-uploaded media), which are the source of truth for presence.
 * Optional Media metadata (caption, alt, hidden) is mapped onto storage objects
 * by path. Discovery failure never breaks the page — it logs and falls back to
 * whatever source succeeded, so the section can still show its labelled empty
 * state.
 */

type MetadataRow = {
  storage_path: string;
  alt: string | null;
  caption: string | null;
  hidden?: boolean | null;
};

async function loadMetadata(bucket: string): Promise<QualityFirstMetadata[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const withHidden = await supabase
      .from("media")
      .select("storage_path, alt, caption, hidden")
      .eq("bucket", bucket);

    let rows: MetadataRow[];

    if (withHidden.error) {
      // The `hidden` column lands with the Quality First migration; before it is
      // applied, discovery still works and simply treats every item as visible.
      const fallback = await supabase
        .from("media")
        .select("storage_path, alt, caption")
        .eq("bucket", bucket);

      if (fallback.error) {
        return [];
      }

      rows = (fallback.data ?? []) as MetadataRow[];
    } else {
      rows = (withHidden.data ?? []) as MetadataRow[];
    }

    return rows.map((row) => ({
      path: row.storage_path,
      hidden: row.hidden === true,
      alt: row.alt ?? null,
      caption: row.caption ?? null,
    }));
  } catch (error) {
    console.error("[quality-first] metadata load failed:", error);
    return [];
  }
}

async function loadStorageFiles(bucket: string): Promise<StorageFile[]> {
  try {
    return await listStorageObjects(bucket);
  } catch (error) {
    console.error("[quality-first] storage listing failed:", error);
    return [];
  }
}

function storageBase(): string | null {
  try {
    return getSupabaseUrl();
  } catch {
    return null;
  }
}

/** Local assets win over a storage object with the same path. */
function mergeFiles(
  local: readonly StorageFile[],
  remote: readonly StorageFile[],
): StorageFile[] {
  const seen = new Set(local.map((file) => file.path));
  return [...local, ...remote.filter((file) => !seen.has(file.path))];
}

/** The visible testing story videos, in natural order. */
export async function listQualityFirstStories(): Promise<QualityFirstStory[]> {
  const localFiles = readLocalStoryFiles();
  const localPaths = new Set(localFiles.map((file) => file.path));

  const [remoteFiles, metadata] = await Promise.all([
    loadStorageFiles(STORY_BUCKET),
    loadMetadata(STORY_BUCKET),
  ]);

  const files = mergeFiles(localFiles, remoteFiles);
  const base = storageBase();

  const resolve = (path: string): string | null =>
    localPaths.has(path)
      ? localStoryUrl(path)
      : base
        ? resolveMediaPublicUrl(base, STORY_BUCKET, path)
        : null;

  return discoverStories({ files, metadata })
    .map((story) => {
      const url = resolve(story.path);
      if (!url) {
        return null;
      }
      return {
        path: story.path,
        url,
        posterUrl: story.posterPath ? resolve(story.posterPath) : null,
        title: story.title,
        alt: story.alt,
        caption: story.caption,
      };
    })
    .filter((story): story is QualityFirstStory => story !== null);
}

/** The visible testing machine images, in natural order. */
export async function listQualityFirstMachineImages(): Promise<
  QualityFirstMachineImage[]
> {
  const localFiles = readLocalMachineFiles();
  const localPaths = new Set(localFiles.map((file) => file.path));

  const [remoteFiles, metadata] = await Promise.all([
    loadStorageFiles(MACHINE_BUCKET),
    loadMetadata(MACHINE_BUCKET),
  ]);

  const files = mergeFiles(localFiles, remoteFiles);
  const base = storageBase();

  const resolve = (path: string): string | null =>
    localPaths.has(path)
      ? localMachineUrl(path)
      : base
        ? resolveMediaPublicUrl(base, MACHINE_BUCKET, path)
        : null;

  return discoverMachineImages({ files, metadata })
    .map((image) => {
      const url = resolve(image.path);
      if (!url) {
        return null;
      }
      return {
        path: image.path,
        url,
        alt: image.alt,
        caption: image.caption,
      };
    })
    .filter((image): image is QualityFirstMachineImage => image !== null);
}

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
} from "./quality-first";
import { listStorageObjects } from "./storage-list";
import { resolveMediaPublicUrl } from "./url";

/**
 * Server-side Quality First media discovery (spec #3 / Ticket 5, ADR-0006).
 *
 * Storage presence is the source of truth: this lists the objects in the
 * `testing-videos` / `machine-images` buckets at read time and maps optional
 * Media metadata (caption, alt, hidden) onto them by storage path. Discovery
 * failure never breaks the page — it logs and returns an empty set so the
 * section falls back to its labelled empty state.
 */

type MetadataRow = {
  storage_path: string;
  alt: string | null;
  caption: string | null;
  hidden?: boolean | null;
};

async function loadMetadata(bucket: string): Promise<QualityFirstMetadata[]> {
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
}

/** The visible testing story videos, in natural order. */
export async function listQualityFirstStories(): Promise<QualityFirstStory[]> {
  try {
    const [files, metadata] = await Promise.all([
      listStorageObjects(STORY_BUCKET),
      loadMetadata(STORY_BUCKET),
    ]);

    const base = getSupabaseUrl();

    return discoverStories({ files, metadata }).map((story) => ({
      path: story.path,
      url: resolveMediaPublicUrl(base, STORY_BUCKET, story.path),
      posterUrl: story.posterPath
        ? resolveMediaPublicUrl(base, STORY_BUCKET, story.posterPath)
        : null,
      title: story.title,
      alt: story.alt,
      caption: story.caption,
    }));
  } catch (error) {
    console.error("[quality-first] story discovery failed:", error);
    return [];
  }
}

/** The visible testing machine images, in natural order. */
export async function listQualityFirstMachineImages(): Promise<
  QualityFirstMachineImage[]
> {
  try {
    const [files, metadata] = await Promise.all([
      listStorageObjects(MACHINE_BUCKET),
      loadMetadata(MACHINE_BUCKET),
    ]);

    const base = getSupabaseUrl();

    return discoverMachineImages({ files, metadata }).map((image) => ({
      path: image.path,
      url: resolveMediaPublicUrl(base, MACHINE_BUCKET, image.path),
      alt: image.alt,
      caption: image.caption,
    }));
  } catch (error) {
    console.error("[quality-first] machine image discovery failed:", error);
    return [];
  }
}

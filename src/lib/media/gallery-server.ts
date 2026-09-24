import { getSupabaseUrl } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  discoverGalleryImages,
  GALLERY_BUCKET,
  type GalleryFile,
  type GalleryImage,
  type GalleryMetadata,
} from "./gallery";
import { resolveMediaPublicUrl } from "./url";

/**
 * Server-side Gallery image discovery (spec #7 / Ticket #21).
 *
 * Storage presence is the source of truth: this lists the objects in the
 * `gallery` bucket at read time and maps optional Media metadata (caption, alt)
 * onto them by storage path, newest first by object creation time. Discovery
 * failure never breaks the page — it logs and returns an empty set so the grid
 * falls back to its labelled empty state.
 */

/** How deep to descend into year-month folders created by the uploader. */
const MAX_LIST_DEPTH = 3;

type SupabaseListEntry = {
  name: string;
  id: string | null;
  created_at?: string | null;
};

async function listObjects(
  prefix = "",
  depth = MAX_LIST_DEPTH,
): Promise<GalleryFile[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(GALLERY_BUCKET)
    .list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } });

  if (error) {
    throw new Error(error.message);
  }

  const files: GalleryFile[] = [];

  for (const entry of (data ?? []) as SupabaseListEntry[]) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.id === null) {
      if (depth > 0) {
        files.push(...(await listObjects(path, depth - 1)));
      }
      continue;
    }

    files.push({ path, createdAt: entry.created_at ?? "" });
  }

  return files;
}

type MetadataRow = {
  storage_path: string;
  caption: string | null;
  alt: string | null;
};

async function loadMetadata(): Promise<GalleryMetadata[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media")
    .select("storage_path, caption, alt")
    .eq("bucket", GALLERY_BUCKET);

  if (error) {
    return [];
  }

  return ((data ?? []) as MetadataRow[]).map((row) => ({
    path: row.storage_path,
    caption: row.caption ?? null,
    alt: row.alt ?? null,
  }));
}

/** The gallery images, newest first, with caption/alt resolved and URLs added. */
export async function listGalleryImages(): Promise<GalleryImage[]> {
  try {
    const [files, metadata] = await Promise.all([listObjects(), loadMetadata()]);

    const base = getSupabaseUrl();

    return discoverGalleryImages({ files, metadata }).map((image) => ({
      ...image,
      url: resolveMediaPublicUrl(base, GALLERY_BUCKET, image.path),
    }));
  } catch (error) {
    console.error("[gallery] image discovery failed:", error);
    return [];
  }
}

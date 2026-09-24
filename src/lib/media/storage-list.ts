import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Shared server-side storage discovery plumbing (ADR-0006).
 *
 * Quality First and the Gallery both discover their media by listing a bucket
 * at read time and mapping optional Media metadata onto the objects by storage
 * path. This module holds the one copy of the recursive bucket listing they
 * share; each domain keeps its own whitelist, ordering and metadata rules.
 */

/** A file discovered in a Supabase Storage bucket listing. */
export type StorageObjectFile = {
  /** Bucket-relative object key, no leading slash. */
  path: string;
  /** Storage object creation time (ISO 8601), or "" when unavailable. */
  createdAt: string;
};

/** How deep to descend into year-month folders created by the uploader. */
const MAX_LIST_DEPTH = 3;

type SupabaseListEntry = {
  name: string;
  id: string | null;
  created_at?: string | null;
};

/**
 * Recursively list the objects in a bucket, returning their bucket-relative
 * paths and creation times. Folder entries are descended into; a listing error
 * throws so the caller can fall back to its labelled empty state.
 */
export async function listStorageObjects(
  bucket: string,
  prefix = "",
  depth = MAX_LIST_DEPTH,
): Promise<StorageObjectFile[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } });

  if (error) {
    throw new Error(error.message);
  }

  const files: StorageObjectFile[] = [];

  for (const entry of (data ?? []) as SupabaseListEntry[]) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.id === null) {
      if (depth > 0) {
        files.push(...(await listStorageObjects(bucket, path, depth - 1)));
      }
      continue;
    }

    files.push({ path, createdAt: entry.created_at ?? "" });
  }

  return files;
}

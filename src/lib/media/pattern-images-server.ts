import { getSupabaseUrl } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  normalizePatternCode,
  PATTERN_IMAGE_BUCKET_ID,
} from "./pattern-image-batch";
import { mapPatternImageUrls } from "./pattern-images";

/**
 * Server-side read of Pattern-level imagery (ADR-0006 principle: presence is
 * data-driven from the Media layer, not a code-level map).
 *
 * A Pattern image is a `public.media` row in the dedicated `product-images`
 * bucket whose `pattern_code` names the Pattern. Discovery failure never breaks
 * a product page — it logs and returns an empty result so cards fall back to
 * their neutral placeholder.
 */

/** A resolved Pattern image association, as consumed by the Admin uploader. */
export type PatternImageRecord = {
  mediaId: string;
  /** Normalized Pattern Code. */
  code: string;
  /** Raw `pattern_code` as stored. */
  patternCode: string;
  path: string;
  url: string;
};

const RECORD_COLUMNS = "id, pattern_code, storage_path, created_at";

type MediaRow = {
  id: string;
  pattern_code: string | null;
  storage_path: string;
  created_at?: string | null;
};

async function loadRows(): Promise<MediaRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("media")
      .select(RECORD_COLUMNS)
      .eq("bucket", PATTERN_IMAGE_BUCKET_ID)
      .not("pattern_code", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[pattern-images] media load failed:", error.message);
      return [];
    }

    return (data ?? []) as MediaRow[];
  } catch (error) {
    console.error("[pattern-images] media load failed:", error);
    return [];
  }
}

/** Every Pattern image association, newest first. */
export async function listPatternImageRecords(): Promise<PatternImageRecord[]> {
  const rows = await loadRows();
  const base = safeSupabaseUrl();
  if (!base) {
    return [];
  }

  const seen = new Set<string>();
  const records: PatternImageRecord[] = [];

  for (const row of rows) {
    if (!row.pattern_code) {
      continue;
    }
    const code = normalizePatternCode(row.pattern_code);
    if (code === "" || seen.has(code)) {
      continue;
    }
    seen.add(code);
    records.push({
      mediaId: row.id,
      code,
      patternCode: row.pattern_code,
      path: row.storage_path,
      url: mapPatternImageUrls([row], base).get(code) as string,
    });
  }

  return records;
}

function safeSupabaseUrl(): string | null {
  try {
    return getSupabaseUrl();
  } catch {
    return null;
  }
}

/** Map normalized Pattern Code → public image URL for the public pages. */
export async function listPatternImageUrls(): Promise<Map<string, string>> {
  const rows = await loadRows();
  const base = safeSupabaseUrl();
  if (!base) {
    return new Map();
  }
  return mapPatternImageUrls(rows, base);
}

/** The public image URL for one Pattern, or `null` when it has none. */
export async function getPatternImageUrl(
  patternCode: string,
): Promise<string | null> {
  const urls = await listPatternImageUrls();
  return urls.get(normalizePatternCode(patternCode)) ?? null;
}

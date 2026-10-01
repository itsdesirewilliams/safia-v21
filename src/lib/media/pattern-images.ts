import {
  normalizePatternCode,
  PATTERN_IMAGE_BUCKET_ID,
} from "./pattern-image-batch";
import { resolveMediaPublicUrl } from "./url";

/**
 * Pure mapping from `public.media` rows to Pattern-level image URLs. The
 * association is entirely data-driven: a Media record's `pattern_code` links
 * it to the canonical Pattern Code, and the newest record wins if duplicates
 * ever exist.
 */

export type PatternImageRow = {
  pattern_code: string | null;
  storage_path: string;
  created_at?: string | null;
};

/** Map normalized Pattern Code → public image URL. */
export function mapPatternImageUrls(
  rows: readonly PatternImageRow[],
  supabaseUrl: string,
): Map<string, string> {
  const urls = new Map<string, string>();

  for (const row of rows) {
    if (!row.pattern_code) {
      continue;
    }
    const code = normalizePatternCode(row.pattern_code);
    if (code === "" || urls.has(code)) {
      continue;
    }
    urls.set(
      code,
      resolveMediaPublicUrl(
        supabaseUrl,
        PATTERN_IMAGE_BUCKET_ID,
        row.storage_path,
      ),
    );
  }

  return urls;
}

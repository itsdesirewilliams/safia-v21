import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import type { RangeId } from "@/lib/catalogue/range-data";
import { naturalCompare } from "@/lib/natural-order";

/**
 * Server-only discovery of the supplied radial-range catalogue artwork.
 *
 * Each radial range (TBR, PCR) ships **landscape artwork only** — there is no
 * portrait/mobile variant, so every catalogue page is shown at its natural
 * ratio at every viewport and is never cropped. The pages live directly in
 * `public/assets/catalogue/<range>/` (a `landscape/` subfolder is used instead
 * when one exists), so dropping a numbered page in adds it with no code change.
 * Until any page exists the owning page renders its neutral labelled
 * placeholder (no invented imagery).
 */

/** Image formats accepted for the catalogue artwork. */
export const RANGE_CATALOGUE_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".svg",
] as const;

const PUBLIC_DIR = join(process.cwd(), "public");

function isCatalogueImage(filename: string): boolean {
  const lower = filename.toLowerCase();
  return RANGE_CATALOGUE_IMAGE_EXTENSIONS.some((extension) =>
    lower.endsWith(extension),
  );
}

/** A range's artwork folder segments (repo-relative) and its public URL root. */
function rangeCatalogueLocation(range: RangeId): {
  segments: string[];
  urlRoot: string;
} {
  const base = ["assets", "catalogue", range];
  const landscape = [...base, "landscape"];

  if (existsSync(join(PUBLIC_DIR, ...landscape))) {
    return {
      segments: landscape,
      urlRoot: `/assets/catalogue/${range}/landscape`,
    };
  }

  return { segments: base, urlRoot: `/assets/catalogue/${range}` };
}

/**
 * Every supplied landscape catalogue page URL for a range, in natural page
 * order (`2` before `10`). An empty array when the range ships no artwork yet.
 */
export function readRangeCatalogueLandscapeImages(range: RangeId): string[] {
  const { segments, urlRoot } = rangeCatalogueLocation(range);

  try {
    return readdirSync(join(PUBLIC_DIR, ...segments), { withFileTypes: true })
      .filter((entry) => entry.isFile() && isCatalogueImage(entry.name))
      .map((entry) => entry.name)
      .sort(naturalCompare)
      .map((filename) => `${urlRoot}/${encodeURIComponent(filename)}`);
  } catch {
    return [];
  }
}

import { readdirSync } from "node:fs";
import { join } from "node:path";

import type { RangeId } from "@/lib/catalogue/range-data";
import { naturalCompare } from "@/lib/natural-order";

/**
 * Server-only discovery of the supplied radial-range catalogue artwork.
 *
 * Each radial range (TBR, PCR) ships **landscape artwork only** — there is no
 * portrait/mobile variant, so the image is shown at its natural ratio at every
 * viewport and is never cropped. Drop a landscape file into
 * `public/assets/catalogue/<range>/landscape/` and it appears with no code
 * change; until then the page renders its neutral labelled placeholder (no
 * invented imagery).
 */

/** Public URL root for each range's landscape catalogue artwork. */
export const RANGE_CATALOGUE_LANDSCAPE_ROOTS: Record<RangeId, string> = {
  tbr: "/assets/catalogue/tbr/landscape",
  pcr: "/assets/catalogue/pcr/landscape",
};

/** Image formats accepted for the catalogue artwork. */
export const RANGE_CATALOGUE_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".svg",
] as const;

function isCatalogueImage(filename: string): boolean {
  const lower = filename.toLowerCase();
  return RANGE_CATALOGUE_IMAGE_EXTENSIONS.some((extension) =>
    lower.endsWith(extension),
  );
}

function rangeCatalogueDir(range: RangeId): string {
  return join(
    process.cwd(),
    "public",
    "assets",
    "catalogue",
    range,
    "landscape",
  );
}

/** The supplied landscape catalogue URL for a range, or `null` when absent. */
export function readRangeCatalogueLandscapeImage(
  range: RangeId,
): string | null {
  try {
    const filename = readdirSync(rangeCatalogueDir(range), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile() && isCatalogueImage(entry.name))
      .map((entry) => entry.name)
      .sort(naturalCompare)[0];

    return filename
      ? `${RANGE_CATALOGUE_LANDSCAPE_ROOTS[range]}/${encodeURIComponent(filename)}`
      : null;
  } catch {
    return null;
  }
}

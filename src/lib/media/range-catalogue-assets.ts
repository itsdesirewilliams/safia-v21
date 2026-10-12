import type { RangeId } from "@/lib/catalogue/range-data";

import manifest from "./range-catalogue-pages.json";

/**
 * The supplied landscape catalogue pages for each radial range, in natural page
 * order (`2` before `10`).
 *
 * The list is generated at build time from `public/assets/catalogue/<range>/`
 * by `scripts/generate-range-catalogue-manifest.mjs` (run automatically before
 * `next build` via the `prebuild` script). Reading the filesystem at request
 * time instead would make Next trace the whole `public/` folder into every page
 * function — including the tens of MB of catalogue artwork — which exceeds
 * Vercel's serverless function size limit. The artwork files themselves are
 * never modified; adding or removing a page and rebuilding refreshes the list.
 *
 * Each radial range ships **landscape artwork only** — there is no portrait/
 * mobile variant, so every page is shown at its natural ratio at every viewport
 * and is never cropped. Until any page exists the owning page renders its
 * neutral labelled placeholder (no invented imagery).
 */
const RANGE_CATALOGUE_PAGES = manifest as Record<RangeId, string[]>;

/** Every supplied landscape catalogue page URL for a range, in natural order. */
export function readRangeCatalogueLandscapeImages(range: RangeId): string[] {
  return RANGE_CATALOGUE_PAGES[range] ?? [];
}

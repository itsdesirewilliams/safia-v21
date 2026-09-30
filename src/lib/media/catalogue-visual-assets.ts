import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * The supplied homepage catalogue-header graphic — the transparent catalogue
 * covers shown floating over the "Explore the Official Catalogue" card.
 *
 * It lives at `public/assets/catalogue-header.png` (a fixed location; do not
 * move or rename it) and is served at `/assets/catalogue-header.png`. It is a
 * static presentation asset, deliberately separate from the Supabase/Gallery
 * media system. When the file is absent the section keeps its designed
 * placeholder visual.
 */

/** Public URL of the homepage catalogue-header graphic. */
export const CATALOGUE_HEADER_ASSET = "/assets/catalogue-header.png";

/** Intrinsic pixel size of the supplied graphic (used for its natural ratio). */
export const CATALOGUE_HEADER_WIDTH = 1080;
export const CATALOGUE_HEADER_HEIGHT = 1199;

const PUBLIC_DIR = join(process.cwd(), "public");
const CATALOGUE_HEADER_FILE = join(
  PUBLIC_DIR,
  "assets",
  "catalogue-header.png",
);

/** The supplied catalogue-header graphic URL, or `null` when it is absent. */
export function readCatalogueHeaderImage(): string | null {
  return existsSync(CATALOGUE_HEADER_FILE) ? CATALOGUE_HEADER_ASSET : null;
}

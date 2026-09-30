import { readdirSync } from "node:fs";
import { join } from "node:path";

import { naturalCompare } from "@/lib/natural-order";

/**
 * Server-only discovery of the supplied "Explore the Catalogue" visual — the
 * artwork shown on the right of the homepage catalogue section (for example the
 * catalogue covers floating in the air). The file lives in
 * `public/assets/catalogue/explore-catalogue/` so it ships with the deployment
 * and is served under `/assets/catalogue/explore-catalogue`. It is a static
 * presentation asset, separate from the Supabase/Gallery media system; while it
 * is absent the section keeps its designed placeholder visual.
 */

/** Public URL root for the supplied explore-catalogue visual. */
export const EXPLORE_CATALOGUE_ASSET_ROOT =
  "/assets/catalogue/explore-catalogue";

/** Image formats accepted as the explore-catalogue visual. */
export const EXPLORE_CATALOGUE_IMAGE_EXTENSIONS = [
  ".webp",
  ".jpg",
  ".jpeg",
  ".png",
  ".avif",
] as const;

const PUBLIC_DIR = join(process.cwd(), "public");

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(dot).toLowerCase() : "";
}

/** Whether a filename is a supported explore-catalogue image. */
export function isExploreCatalogueImage(filename: string): boolean {
  const extension = extensionOf(filename);
  return (
    extension !== "" &&
    (EXPLORE_CATALOGUE_IMAGE_EXTENSIONS as readonly string[]).includes(extension)
  );
}

/** The public URL of the first supplied explore-catalogue image, or `null`. */
export function discoverExploreCatalogueImage(
  filenames: readonly string[],
): string | null {
  const filename = filenames
    .filter(isExploreCatalogueImage)
    .sort(naturalCompare)[0];

  return filename
    ? `${EXPLORE_CATALOGUE_ASSET_ROOT}/${encodeURIComponent(filename)}`
    : null;
}

/** The supplied explore-catalogue image URL, or `null` when none is present. */
export function readExploreCatalogueImage(): string | null {
  try {
    const filenames = readdirSync(
      join(PUBLIC_DIR, "assets", "catalogue", "explore-catalogue"),
      { withFileTypes: true },
    )
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);

    return discoverExploreCatalogueImage(filenames);
  } catch {
    return null;
  }
}

import { readdirSync } from "node:fs";
import { join } from "node:path";

import { CATEGORIES, type CategorySlug } from "@/lib/catalogue/categories";
import { naturalCompare } from "@/lib/natural-order";

/**
 * Server-only discovery of the developer-provided homepage product-range
 * images. Each canonical range has its own folder under
 * `public/assets/products/<slug>/`, so the files ship with the deployment and
 * are served at `/assets/products/<slug>`. Dropping a supported image into a
 * range folder is the only step needed to show it — these are static
 * presentation assets, deliberately separate from the Supabase/Gallery media
 * system. When a range has no image the card keeps its designed placeholder.
 */

/** Public URL root for the product-range presentation assets. */
export const PRODUCT_RANGE_ASSET_ROOT = "/assets/products";

/** Image formats discovered in a product-range folder. */
export const PRODUCT_RANGE_IMAGE_EXTENSIONS = [
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

/** Whether a filename is one of the supported product-range image formats. */
export function isProductRangeImage(filename: string): boolean {
  const extension = extensionOf(filename);
  return (
    extension !== "" &&
    (PRODUCT_RANGE_IMAGE_EXTENSIONS as readonly string[]).includes(extension)
  );
}

/** The public URL for one range image, percent-encoded for spaces and symbols. */
export function productRangeImageUrl(
  slug: CategorySlug,
  filename: string,
): string {
  return `${PRODUCT_RANGE_ASSET_ROOT}/${slug}/${encodeURIComponent(filename)}`;
}

/** The first supported image in a range folder (naturally ordered), or `null`. */
function readRangeImage(slug: CategorySlug): string | null {
  try {
    const filenames = readdirSync(
      join(PUBLIC_DIR, "assets", "products", slug),
      { withFileTypes: true },
    )
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter(isProductRangeImage)
      .sort(naturalCompare);

    return filenames[0] ? productRangeImageUrl(slug, filenames[0]) : null;
  } catch {
    return null;
  }
}

/**
 * The supplied image for every canonical range, keyed by slug, or `null` when a
 * range has no image yet. Read at render time, so adding an image is a matter of
 * shipping the file into its range folder.
 */
export function readProductRangeImages(): Record<CategorySlug, string | null> {
  const images = {} as Record<CategorySlug, string | null>;
  for (const { slug } of CATEGORIES) {
    images[slug] = readRangeImage(slug);
  }
  return images;
}

import { readdirSync } from "node:fs";
import { join } from "node:path";

import { CATEGORIES, type CategorySlug } from "@/lib/catalogue/categories";
import { naturalCompare } from "@/lib/natural-order";

/**
 * Server-only discovery of the developer-provided homepage product-range
 * thumbnails.
 *
 * All thumbnails live directly in `public/assets/products/` — no category
 * subfolders — and are served at `/assets/products/<file>`. Each file is matched
 * to a canonical range by name: the file's name tokens must contain one of the
 * range's known alias phrases as a contiguous run, so `motorcycle.webp`,
 * `moto.png`, `truck-bus.jpg`, `Truck & Bus Tyres.jpg`, `tuktuk.png` and
 * `tube.png` all resolve. These are static presentation assets, separate from
 * the Supabase/Gallery media system; the category/product mapping is unchanged,
 * and a range with no matching file keeps its designed placeholder (no
 * invented imagery).
 */

/** Public URL root for the flat product-range presentation assets. */
export const PRODUCT_RANGE_ASSET_ROOT = "/assets/products";

/** Image formats discovered in the products folder. */
export const PRODUCT_RANGE_IMAGE_EXTENSIONS = [
  ".webp",
  ".jpg",
  ".jpeg",
  ".png",
  ".avif",
] as const;

/**
 * Filename alias phrases per range, in addition to the canonical slug itself.
 * Add a short name here when a supplied file is named loosely; the mapping stays
 * centralized and the product data is never touched.
 */
const RANGE_FILENAME_ALIASES: Record<CategorySlug, readonly string[]> = {
  motorcycle: ["moto", "motorbike", "bike", "two wheeler", "2 wheeler"],
  "three-wheeler": [
    "tuktuk",
    "tuk tuk",
    "tuk",
    "auto rickshaw",
    "autorickshaw",
    "rickshaw",
    "auto",
  ],
  "truck-bus": ["truck", "lorry", "bus"],
  agriculture: ["agri", "tractor", "farm"],
  otr: ["off road", "offroad", "earthmover"],
  forklift: ["fork lift"],
  tubes: ["tube"],
};

const PUBLIC_DIR = join(process.cwd(), "public");
const PRODUCTS_DIR = join(PUBLIC_DIR, "assets", "products");

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

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/** Lower-case alphanumeric tokens of a filename, with its extensions removed. */
export function rangeNameTokens(filename: string): string[] {
  let stem = filename;
  while (isProductRangeImage(stem)) {
    stem = stem.slice(0, -extensionOf(stem).length);
  }
  return tokenize(stem);
}

/** Whether `needle` appears as a contiguous run inside `haystack`. */
function containsRun(
  haystack: readonly string[],
  needle: readonly string[],
): boolean {
  if (needle.length === 0 || haystack.length < needle.length) {
    return false;
  }
  for (let start = 0; start + needle.length <= haystack.length; start += 1) {
    let matched = true;
    for (let offset = 0; offset < needle.length; offset += 1) {
      if (haystack[start + offset] !== needle[offset]) {
        matched = false;
        break;
      }
    }
    if (matched) {
      return true;
    }
  }
  return false;
}

/** Every accepted token phrase per range (canonical slug + aliases). */
const ALIAS_TOKENS: Record<CategorySlug, string[][]> = CATEGORIES.reduce(
  (acc, { slug }) => {
    acc[slug] = [slug, ...(RANGE_FILENAME_ALIASES[slug] ?? [])].map(tokenize);
    return acc;
  },
  {} as Record<CategorySlug, string[][]>,
);

/** Whether a file name belongs to a canonical range. */
export function matchesCategory(filename: string, slug: CategorySlug): boolean {
  const fileTokens = rangeNameTokens(filename);
  return ALIAS_TOKENS[slug].some((alias) => containsRun(fileTokens, alias));
}

/** The public URL for one flat product-range thumbnail. */
export function productRangeImageUrl(filename: string): string {
  return `${PRODUCT_RANGE_ASSET_ROOT}/${encodeURIComponent(filename)}`;
}

/** The supplied flat image files, naturally ordered. */
function listProductRangeFiles(): string[] {
  try {
    return readdirSync(PRODUCTS_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter(isProductRangeImage)
      .sort(naturalCompare);
  } catch {
    return [];
  }
}

/**
 * The supplied thumbnail for every canonical range, keyed by slug, or `null`
 * when no file matches. Read at render time, so dropping a file into
 * `public/assets/products/` is all it takes to show it.
 */
export function readProductRangeImages(): Record<CategorySlug, string | null> {
  const filenames = listProductRangeFiles();
  const images = {} as Record<CategorySlug, string | null>;
  for (const { slug } of CATEGORIES) {
    const match = filenames.find((name) => matchesCategory(name, slug));
    images[slug] = match ? productRangeImageUrl(match) : null;
  }
  return images;
}

import { readdirSync } from "node:fs";
import { join } from "node:path";

import {
  buildPortraitOnlySlides,
  buildSliderSlides,
  isPortraitOnlyCollection,
  SLIDER_ASSET_ROOTS,
  SLIDER_IMAGE_EXTENSIONS,
  type SliderCollection,
  type SliderRatio,
  type SliderSlide,
} from "./slider";

/**
 * Server-only discovery of the developer-provided slider artwork. The folders
 * live under `public/` (the canonical `public/assets/<collection>/<ratio>` or,
 * for Catalogue, `public/assets/catalogue/portrait`), so the files ship with the
 * deployment and are served at the matching URL root. Adding a slide is a matter
 * of dropping a matching filename into the folder — no database or admin step.
 */

const PUBLIC_DIR = join(process.cwd(), "public");

function isImageFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return SLIDER_IMAGE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

/** The repo-relative folder for one collection's ratio. */
export function sliderAssetDirectory(
  collection: SliderCollection,
  ratio: SliderRatio,
): string {
  const segments = SLIDER_ASSET_ROOTS[collection][ratio]
    .split("/")
    .filter(Boolean);
  return ["public", ...segments].join("/");
}

function listAssetFiles(
  collection: SliderCollection,
  ratio: SliderRatio,
): string[] {
  const segments = SLIDER_ASSET_ROOTS[collection][ratio]
    .split("/")
    .filter(Boolean);

  try {
    return readdirSync(join(PUBLIC_DIR, ...segments), { withFileTypes: true })
      .filter((entry) => entry.isFile() && isImageFile(entry.name))
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

/** Every slide for a collection, naturally ordered and ratio-paired. */
export function readSliderSlides(collection: SliderCollection): SliderSlide[] {
  const portrait = listAssetFiles(collection, "portrait");

  // Catalogue ships portrait artwork only; it is never paired with landscape.
  if (isPortraitOnlyCollection(collection)) {
    return buildPortraitOnlySlides(collection, portrait);
  }

  return buildSliderSlides(
    collection,
    listAssetFiles(collection, "landscape"),
    portrait,
  );
}

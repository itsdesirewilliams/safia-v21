import { readdirSync } from "node:fs";
import { join } from "node:path";

import {
  buildPortraitOnlySlides,
  buildSliderSlides,
  isPortraitOnlyCollection,
  SLIDER_ASSET_ROOT,
  SLIDER_IMAGE_EXTENSIONS,
  type SliderCollection,
  type SliderRatio,
  type SliderSlide,
} from "./slider";

/**
 * Server-only discovery of the developer-provided slider artwork. The folders
 * live under `public/` so the files ship with the deployment and are served at
 * `/assets/{ratio}/{collection}`. Adding a slide is a matter of dropping a
 * matching filename into both ratio folders — no database or admin step.
 */

const PUBLIC_DIR = join(process.cwd(), "public");

function isImageFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return SLIDER_IMAGE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

/** The repo-relative folder for one ratio of a collection. */
export function sliderAssetDirectory(
  collection: SliderCollection,
  ratio: SliderRatio,
): string {
  return `public${SLIDER_ASSET_ROOT}/${ratio}/${collection}`;
}

function listAssetFiles(
  collection: SliderCollection,
  ratio: SliderRatio,
): string[] {
  const directory = join(
    PUBLIC_DIR,
    SLIDER_ASSET_ROOT,
    ratio,
    collection,
  );

  try {
    return readdirSync(directory, { withFileTypes: true })
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

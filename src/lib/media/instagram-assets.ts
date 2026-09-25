import { readdirSync } from "node:fs";
import { join } from "node:path";

import {
  discoverInstagramImages,
  INSTAGRAM_ASSET_ROOT,
  type InstagramImage,
} from "./instagram";

/**
 * Server-only discovery of the developer-provided Instagram images. The folder
 * lives under `public/` so the files ship with the deployment and are served at
 * `/assets/instagram`. Adding an image is a matter of dropping a supported file
 * into the folder — no database, token or admin step.
 */

const PUBLIC_DIR = join(process.cwd(), "public");

function listAssetFiles(): string[] {
  const directory = join(PUBLIC_DIR, INSTAGRAM_ASSET_ROOT);

  try {
    return readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

/** Every supported Instagram image, naturally ordered, mapped to public URLs. */
export function readInstagramImages(): InstagramImage[] {
  return discoverInstagramImages(listAssetFiles());
}

import { readdirSync } from "node:fs";
import { join } from "node:path";

import {
  isMachineImage,
  isStoryPoster,
  isStoryVideo,
  STORY_FOLDER,
  type StorageFile,
} from "./quality-first";

/**
 * Server-only discovery of the developer-provided Quality First media under
 * `public/assets`. Testing videos live in
 * `public/assets/testing-videos/stories/` and machine images in
 * `public/assets/machine-images/`. These assets are merged with any Supabase
 * Storage objects at read time, so a file appears simply by being dropped into
 * the folder — the same formats, ordering and poster pairing apply.
 */

const PUBLIC_DIR = join(process.cwd(), "public");

/** Public URL root for the local testing-video assets. */
export const LOCAL_STORY_ASSET_ROOT = "/assets/testing-videos";

/** Public URL root for the local machine-image assets. */
export const LOCAL_MACHINE_ASSET_ROOT = "/assets/machine-images";

function listFiles(...segments: string[]): string[] {
  try {
    return readdirSync(join(PUBLIC_DIR, ...segments), { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

/** Percent-encode each path segment, preserving the `/` separators. */
function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

/**
 * Local story files, keyed under the `stories/` folder so the shared discovery
 * (which only reads that folder) and its poster pairing work unchanged.
 */
export function readLocalStoryFiles(): StorageFile[] {
  return listFiles("assets", "testing-videos", "stories")
    .filter((name) => isStoryVideo(name) || isStoryPoster(name))
    .map((name) => ({ path: `${STORY_FOLDER}/${name}` }));
}

/** Local machine-image files, as plain bucket-relative paths. */
export function readLocalMachineFiles(): StorageFile[] {
  return listFiles("assets", "machine-images")
    .filter((name) => isMachineImage(name))
    .map((name) => ({ path: name }));
}

/** The public URL for a local story path (`stories/<file>`). */
export function localStoryUrl(path: string): string {
  return `${LOCAL_STORY_ASSET_ROOT}/${encodePath(path)}`;
}

/** The public URL for a local machine-image path (`<file>`). */
export function localMachineUrl(path: string): string {
  return `${LOCAL_MACHINE_ASSET_ROOT}/${encodePath(path)}`;
}

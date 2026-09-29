import { readdirSync } from "node:fs";
import { join } from "node:path";

import { slugify } from "@/lib/slug";

/**
 * Server-only discovery of the developer-provided team portraits. The folder
 * lives under `public/` so the files ship with the deployment and are served at
 * `/assets/team`. A member's portrait is found by the slug of their name, so
 * adding or replacing a photo is a matter of dropping a supported file into the
 * folder — no database, admin step or code change.
 */

const PUBLIC_DIR = join(process.cwd(), "public");

/** Public URL path segment for the developer-provided team folder. */
export const TEAM_ASSET_ROOT = "/assets/team";

/** Image formats accepted for team portraits. */
export const TEAM_IMAGE_EXTENSIONS = [
  ".webp",
  ".jpg",
  ".jpeg",
  ".png",
  ".avif",
] as const;

/** The portrait filename for a slug, or `null` when none is supplied. */
export function matchTeamImage(
  slug: string,
  filenames: readonly string[],
): string | null {
  const wanted = new Set(
    TEAM_IMAGE_EXTENSIONS.map((extension) => `${slug}${extension}`),
  );

  return (
    [...filenames]
      .sort((a, b) => a.localeCompare(b))
      .find((filename) => wanted.has(filename.toLowerCase())) ?? null
  );
}

/** The public URL for a team portrait file. */
export function teamImageUrl(filename: string): string {
  return `${TEAM_ASSET_ROOT}/${encodeURIComponent(filename)}`;
}

function listAssetFiles(): string[] {
  try {
    return readdirSync(join(PUBLIC_DIR, "assets", "team"), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

/** The public URL of a member's portrait, matched by the slug of their name. */
export function readTeamImageUrl(name: string): string | null {
  const filename = matchTeamImage(slugify(name), listAssetFiles());
  return filename ? teamImageUrl(filename) : null;
}

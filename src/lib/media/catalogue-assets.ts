import { readdirSync } from "node:fs";
import { join } from "node:path";

import { naturalCompare } from "@/lib/natural-order";

/**
 * Server-only discovery of the supplied catalogue PDF. The file lives under
 * `public/assets/catalogue` so it ships with the deployment and is served at
 * `/assets/catalogue`. The download action points straight at the supplied
 * document; replacing the file updates the link with no code change.
 */

const PUBLIC_DIR = join(process.cwd(), "public");

/** Public URL root for the supplied catalogue documents. */
export const CATALOGUE_ASSET_ROOT = "/assets/catalogue";

/** Document formats accepted as the catalogue download. */
export const CATALOGUE_DOCUMENT_EXTENSIONS = [".pdf"] as const;

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(dot).toLowerCase() : "";
}

/** Whether a filename is a supported catalogue document. */
export function isCatalogueDocument(filename: string): boolean {
  const extension = extensionOf(filename);
  return (
    extension !== "" &&
    (CATALOGUE_DOCUMENT_EXTENSIONS as readonly string[]).includes(extension)
  );
}

/** The public URL of the first supplied catalogue PDF, or `null`. */
export function discoverCataloguePdf(
  filenames: readonly string[],
): string | null {
  const filename = filenames
    .filter(isCatalogueDocument)
    .sort(naturalCompare)[0];

  return filename
    ? `${CATALOGUE_ASSET_ROOT}/${filename
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`
    : null;
}

/** The supplied catalogue PDF URL, or `null` when none is present. */
export function readCataloguePdfUrl(): string | null {
  try {
    const filenames = readdirSync(join(PUBLIC_DIR, "assets", "catalogue"), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);

    return discoverCataloguePdf(filenames);
  } catch {
    return null;
  }
}

import { naturalCompare } from "@/lib/natural-order";

/**
 * Homepage Instagram imagery (local repository assets).
 *
 * The Instagram section is a static media system: images live in
 * `public/assets/instagram` and are discovered at read time. This module is
 * deliberately free of Node built-ins so the client rotation component can
 * import its constants and the `nextInstagramDisplay` window logic; filesystem
 * access lives in `instagram-assets.ts` (server-only).
 */

/** Public URL path segment for the developer-provided Instagram folder. */
export const INSTAGRAM_ASSET_ROOT = "/assets/instagram";

/** Image formats discovered in the Instagram folder. */
export const INSTAGRAM_IMAGE_EXTENSIONS = [
  ".webp",
  ".jpg",
  ".jpeg",
  ".png",
] as const;

/** How many images are shown at once. */
export const INSTAGRAM_DISPLAY_COUNT = 4;

/** How often one of the displayed images is quietly replaced. */
export const INSTAGRAM_ROTATE_MS = 300_000;

/** A displayed Instagram image: its public URL and accessible alt text. */
export type InstagramImage = {
  url: string;
  alt: string;
};

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(dot).toLowerCase() : "";
}

/** Whether a filename is one of the supported web image formats. */
export function isInstagramImage(filename: string): boolean {
  const extension = extensionOf(filename);
  return (
    extension !== "" &&
    (INSTAGRAM_IMAGE_EXTENSIONS as readonly string[]).includes(extension)
  );
}

/** The public URL for one image, percent-encoded for spaces and symbols. */
export function instagramImageUrl(filename: string): string {
  return `${INSTAGRAM_ASSET_ROOT}/${encodeURIComponent(filename)}`;
}

/** The filename without its (possibly stacked) image extension. */
function stemOf(filename: string): string {
  let stem = filename;
  while (isInstagramImage(stem)) {
    stem = stem.slice(0, -extensionOf(stem).length);
  }
  return stem;
}

/** Humanised filename used as alt text. */
export function altFromFilename(filename: string): string {
  return stemOf(filename).replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Discover the supported images in a folder listing, naturally ordered and
 * mapped to their public URLs. Unsupported files are ignored rather than shown.
 */
export function discoverInstagramImages(
  filenames: readonly string[],
): InstagramImage[] {
  const seen = new Set<string>();
  const images: InstagramImage[] = [];

  for (const filename of [...filenames].filter(isInstagramImage).sort(naturalCompare)) {
    const url = instagramImageUrl(filename);
    if (seen.has(url)) {
      continue;
    }
    seen.add(url);
    images.push({ url, alt: altFromFilename(filename) });
  }

  return images;
}

/**
 * The images to display after a rotation.
 *
 * On the first step the first `count` images are shown. Each later step
 * replaces exactly one slot — cycling through the slots in turn — with the next
 * unused image from the natural-order pool. The other slots keep their position
 * and value, so the visitor sees one photo quietly change rather than the grid
 * reshuffling. With no spare image (pool empty or no larger than the display
 * count) the selection is static, and an unknown/absent `current` falls back to
 * the initial selection.
 */
export function nextInstagramDisplay(
  images: readonly InstagramImage[],
  current: readonly InstagramImage[],
  step: number,
): InstagramImage[] {
  const count = Math.min(INSTAGRAM_DISPLAY_COUNT, images.length);

  if (count === 0) {
    return [];
  }

  if (images.length <= count || step <= 0 || current.length !== count) {
    return images.slice(0, count);
  }

  const slot = (step - 1) % count;
  const retained = new Set(
    current
      .filter((_, index) => index !== slot)
      .map((image) => image.url),
  );

  let incoming = current[slot];
  for (let offset = 0; offset < images.length; offset += 1) {
    const candidate = images[(count + step - 1 + offset) % images.length];
    if (!retained.has(candidate.url) && candidate.url !== current[slot].url) {
      incoming = candidate;
      break;
    }
  }

  return current.map((image, index) => (index === slot ? incoming : image));
}

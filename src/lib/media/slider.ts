import { getOptionalCatalogueDownloadUrl } from "@/lib/config";
import { naturalCompare } from "@/lib/natural-order";

/**
 * Shared responsive-slider contract (spec #9).
 *
 * The Catalogue and Business Profile sliders are the same behaviour with a
 * different asset folder: landscape (16:9) at 768px and above, portrait
 * (4:5, 1080×1350) below it, selected by native `<picture>`/`<source media>`
 * art direction rather than cropping one artwork into the other ratio.
 *
 * This module is deliberately free of Node built-ins so the client view can
 * import its constants and types. Filesystem access lives in
 * `slider-assets.ts` (server-only).
 */

/** Collections that ship slider assets. */
export const SLIDER_COLLECTIONS = ["catalogue", "business-profile"] as const;

export type SliderCollection = (typeof SLIDER_COLLECTIONS)[number];

/** Viewport width at which landscape gives way to portrait. */
export const SLIDER_BREAKPOINT_PX = 768;

/** The `<source media>` query that selects portrait artwork. */
export const SLIDER_PORTRAIT_MEDIA = `(max-width: ${SLIDER_BREAKPOINT_PX - 1}px)`;

/** Ratio of a supplied artwork. */
export type SliderRatio = "landscape" | "portrait";

/** Public URL path segment for the developer-provided asset folders. */
export const SLIDER_ASSET_ROOT = "/assets";

/** Image extensions discovered in the asset folders. */
export const SLIDER_IMAGE_EXTENSIONS = [
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
] as const;

/**
 * A single slide: one filename paired across the landscape and portrait
 * folders. Either URL may be `null` when that ratio was not supplied — the
 * slide is still rendered from the other ratio, never dropped or cropped.
 */
export type SliderSlide = {
  filename: string;
  landscape: string | null;
  portrait: string | null;
};

/** Configuration that lets one component serve both sliders. */
export type SliderConfig = {
  collection: SliderCollection;
  label: string;
  /** Optional Catalogue PDF link; `null` for Business Profile. */
  downloadUrl: string | null;
};

const SLIDER_LABELS: Record<SliderCollection, string> = {
  catalogue: "Catalogue",
  "business-profile": "Business Profile",
};

/** The public URL for one asset, or `null` when it was not supplied. */
export function assetUrl(
  collection: SliderCollection,
  ratio: SliderRatio,
  filename: string,
): string {
  return `${SLIDER_ASSET_ROOT}/${ratio}/${collection}/${encodeURIComponent(filename)}`;
}

/**
 * Pair landscape and portrait filenames into slides. The union of both folders
 * is ordered naturally; a filename present in only one folder still produces a
 * slide, with the missing ratio left `null`.
 */
export function pairSliderAssets(
  landscapeFiles: readonly string[],
  portraitFiles: readonly string[],
): { filename: string; landscape: boolean; portrait: boolean }[] {
  const landscapeSet = new Set(landscapeFiles);
  const portraitSet = new Set(portraitFiles);
  const filenames = [...new Set([...landscapeFiles, ...portraitFiles])].sort(
    naturalCompare,
  );

  return filenames.map((filename) => ({
    filename,
    landscape: landscapeSet.has(filename),
    portrait: portraitSet.has(filename),
  }));
}

/** Resolve paired filenames into slides carrying their public asset URLs. */
export function buildSliderSlides(
  collection: SliderCollection,
  landscapeFiles: readonly string[],
  portraitFiles: readonly string[],
): SliderSlide[] {
  return pairSliderAssets(landscapeFiles, portraitFiles).map((pair) => ({
    filename: pair.filename,
    landscape: pair.landscape
      ? assetUrl(collection, "landscape", pair.filename)
      : null,
    portrait: pair.portrait
      ? assetUrl(collection, "portrait", pair.filename)
      : null,
  }));
}

/** Which ratio the given viewport resolves to. */
export function ratioForViewport(viewportWidth: number): SliderRatio {
  return viewportWidth < SLIDER_BREAKPOINT_PX ? "portrait" : "landscape";
}

/**
 * The asset a slide shows at a given viewport: the ratio the viewport asks
 * for, falling back to whichever asset exists so a half-supplied slide still
 * appears.
 */
export function resolveSlideSource(
  slide: SliderSlide,
  viewportWidth: number,
): string {
  const preferred =
    ratioForViewport(viewportWidth) === "portrait"
      ? slide.portrait
      : slide.landscape;
  const source = preferred ?? slide.landscape ?? slide.portrait;

  if (!source) {
    throw new Error(`Slide "${slide.filename}" has no artwork to render.`);
  }

  return source;
}

/** The configuration for a collection — folder identity plus optional link. */
export function resolveSliderConfig(
  collection: SliderCollection,
): SliderConfig {
  return {
    collection,
    label: SLIDER_LABELS[collection],
    downloadUrl:
      collection === "catalogue" ? getOptionalCatalogueDownloadUrl() : null,
  };
}

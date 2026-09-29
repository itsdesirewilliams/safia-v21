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
 * A single slide. `filename` is the stable slide identifier (the landscape
 * filename when one exists, else the portrait). Either URL may be `null` when
 * that ratio was not supplied — the slide is still rendered from the other
 * ratio, never dropped or cropped.
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

/** A slide's pairing across the two ratio folders. */
export type SliderPair = {
  /** Stable slide identifier: the landscape filename when present, else portrait. */
  filename: string;
  /** Landscape filename, or `null` when that ratio was not supplied. */
  landscapeFilename: string | null;
  /** Portrait filename, or `null` when that ratio was not supplied. */
  portraitFilename: string | null;
};

/** The filename without its final extension. */
function stemOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(0, dot) : filename;
}

/**
 * The key used to pair a filename across the two ratio folders. A run of digits
 * (`01 Cover` ↔ `Biz Profile 01`) is the key, so the landscape and portrait
 * exports of the same page pair even when their full names differ; a filename
 * with no digits pairs on its stem.
 */
export function sliderPairKey(filename: string): string {
  const digits = /\d+/.exec(stemOf(filename));
  return digits ? String(Number(digits[0])) : stemOf(filename).toLowerCase();
}

function groupByPairKey(files: readonly string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();

  for (const filename of [...files].sort(naturalCompare)) {
    const key = sliderPairKey(filename);
    const group = groups.get(key);
    if (group) {
      group.push(filename);
    } else {
      groups.set(key, [filename]);
    }
  }

  return groups;
}

/**
 * Pair landscape and portrait filenames into slides. Filenames that share a
 * pairing key are matched index by index (so an extra landscape export yields a
 * landscape-only slide rather than dropping it); the union of both folders is
 * ordered naturally. A filename present in only one folder still produces a
 * slide, with the missing ratio left `null`.
 */
export function pairSliderAssets(
  landscapeFiles: readonly string[],
  portraitFiles: readonly string[],
): SliderPair[] {
  const landscape = groupByPairKey(landscapeFiles);
  const portrait = groupByPairKey(portraitFiles);
  const keys = [...new Set([...landscape.keys(), ...portrait.keys()])].sort(
    naturalCompare,
  );

  const pairs: SliderPair[] = [];

  for (const key of keys) {
    const landscapeGroup = landscape.get(key) ?? [];
    const portraitGroup = portrait.get(key) ?? [];
    const count = Math.max(landscapeGroup.length, portraitGroup.length);

    for (let index = 0; index < count; index += 1) {
      const landscapeFilename = landscapeGroup[index] ?? null;
      const portraitFilename = portraitGroup[index] ?? null;

      pairs.push({
        filename: landscapeFilename ?? portraitFilename ?? key,
        landscapeFilename,
        portraitFilename,
      });
    }
  }

  return pairs;
}

/** Resolve paired filenames into slides carrying their public asset URLs. */
export function buildSliderSlides(
  collection: SliderCollection,
  landscapeFiles: readonly string[],
  portraitFiles: readonly string[],
): SliderSlide[] {
  return pairSliderAssets(landscapeFiles, portraitFiles).map((pair) => ({
    filename: pair.filename,
    landscape: pair.landscapeFilename
      ? assetUrl(collection, "landscape", pair.landscapeFilename)
      : null,
    portrait: pair.portraitFilename
      ? assetUrl(collection, "portrait", pair.portraitFilename)
      : null,
  }));
}

/**
 * Collections that ship portrait artwork only. The Catalogue has no landscape
 * counterparts, so it uses its portrait images at every size rather than
 * art-directing between two ratios.
 */
export const PORTRAIT_ONLY_COLLECTIONS: readonly SliderCollection[] = [
  "catalogue",
];

export function isPortraitOnlyCollection(
  collection: SliderCollection,
): boolean {
  return PORTRAIT_ONLY_COLLECTIONS.includes(collection);
}

/**
 * Build slides from portrait artwork alone, leaving the landscape side `null`
 * so the shared view renders the portrait image at every viewport. Ordering
 * stays natural.
 */
export function buildPortraitOnlySlides(
  collection: SliderCollection,
  portraitFiles: readonly string[],
): SliderSlide[] {
  return [...new Set(portraitFiles)].sort(naturalCompare).map((filename) => ({
    filename,
    landscape: null,
    portrait: assetUrl(collection, "portrait", filename),
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

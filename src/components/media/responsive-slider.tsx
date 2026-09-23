import { SectionPlaceholder } from "@/components/home/section-placeholder";
import { readSliderSlides, sliderAssetDirectory } from "@/lib/media/slider-assets";
import { resolveSliderConfig, type SliderCollection } from "@/lib/media/slider";

import { ResponsiveSliderView } from "./responsive-slider-view";

export type ResponsiveSliderProps = {
  /** Which developer-provided asset folder this slider serves. */
  collection: SliderCollection;
  className?: string;
};

/**
 * The shared responsive slider used by the Catalogue and Business Profile
 * sliders (spec #9). This server wrapper resolves the developer-provided
 * artwork from the repo folders and hands it to the interactive view; the
 * component itself is configured purely by `collection`, so both pages share
 * one implementation.
 */
export function ResponsiveSlider({
  collection,
  className,
}: ResponsiveSliderProps) {
  const config = resolveSliderConfig(collection);
  const slides = readSliderSlides(collection);

  if (slides.length === 0) {
    return (
      <SectionPlaceholder
        label={`${config.label} slider artwork not supplied`}
        detail={`Add matching image files to ${sliderAssetDirectory(
          collection,
          "landscape",
        )} and ${sliderAssetDirectory(
          collection,
          "portrait",
        )} to show this slider.`}
      />
    );
  }

  return (
    <ResponsiveSliderView
      config={config}
      slides={slides}
      className={className}
    />
  );
}

import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { readSliderSlides } from "@/lib/media/slider-assets";
import { resolveSliderConfig, type SliderCollection } from "@/lib/media/slider";

import { ResponsiveSliderView } from "./responsive-slider-view";

export type ResponsiveSliderProps = {
  /** Which developer-provided asset folder this slider serves. */
  collection: SliderCollection;
  className?: string;
  /**
   * When false, the slider's built-in download action is suppressed so the
   * owning page can render its own (used by Catalogue to gate the action on a
   * configured URL). Defaults to true.
   */
  showDownload?: boolean;
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
  showDownload = true,
}: ResponsiveSliderProps) {
  const config = resolveSliderConfig(collection);
  const slides = readSliderSlides(collection);

  if (slides.length === 0) {
    return (
      <PlaceholderPanel
        kind="media"
        label={`${config.label} Coming Soon`}
        detail={`This ${config.label.toLowerCase()} will be available here soon.`}
      />
    );
  }

  return (
    <ResponsiveSliderView
      config={showDownload ? config : { ...config, downloadUrl: null }}
      slides={slides}
      className={className}
    />
  );
}

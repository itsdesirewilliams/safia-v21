import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import type { QualityFirstMachineImage } from "@/lib/media/quality-first";
import { QUALITY_FIRST_EMPTY_STATES } from "@/lib/quality-first";

export type MachineMasonryProps = {
  images: readonly QualityFirstMachineImage[];
};

/**
 * Machine/testing imagery in a masonry layout — approved here specifically for
 * Quality First (the main Gallery is not masonry). CSS multi-columns preserve
 * each image's natural aspect ratio with no destructive cropping, and captions
 * come from the optional Media metadata.
 */
export function MachineMasonry({ images }: MachineMasonryProps) {
  if (images.length === 0) {
    return (
      <PlaceholderPanel
        kind="media"
        label={QUALITY_FIRST_EMPTY_STATES.machines.label}
        detail={QUALITY_FIRST_EMPTY_STATES.machines.detail}
      />
    );
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {images.map((image, index) => {
        const alt =
          image.alt ?? image.caption ?? "Safeway Tyre testing machine";
        const caption = image.caption;

        return (
          <Reveal
            key={image.path}
            delay={Math.min(index, 8) * 60}
            className="mb-4 break-inside-avoid"
          >
            <figure className="group">
              <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-100">
                {/* Natural aspect ratio is preserved; the masonry layout relies on it. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={alt}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </div>
              {caption && (
                <figcaption className="mt-2.5 px-1 text-xs leading-relaxed text-ink-600">
                  {caption}
                </figcaption>
              )}
            </figure>
          </Reveal>
        );
      })}
    </div>
  );
}

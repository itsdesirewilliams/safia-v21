"use client";

import { useState } from "react";

import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import { GALLERY_EMPTY_STATE } from "@/lib/gallery";
import type { GalleryImage } from "@/lib/media/gallery";

import { GalleryViewer } from "./gallery-viewer";

export type GalleryGridProps = {
  images: readonly GalleryImage[];
};

/**
 * The public Gallery grid (spec #7 / Ticket #21). A regular responsive image
 * grid — deliberately NOT masonry — that opens the fullscreen viewer for a
 * selected image. Images are discovered from the `gallery` bucket, newest
 * first; captions come from the optional Media record.
 */
export function GalleryGrid({ images }: GalleryGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <PlaceholderPanel
        kind="media"
        label={GALLERY_EMPTY_STATE.label}
        detail={GALLERY_EMPTY_STATE.detail}
      />
    );
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {images.map((image, index) => (
          <li key={image.path}>
            <Reveal delay={Math.min(index, 8) * 50}>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`Open image ${index + 1} of ${images.length}: ${image.caption}`}
                className="group block w-full overflow-hidden rounded-lg border border-ink-200 bg-ink-100 shadow-soft transition-shadow hover:shadow-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt}
                  loading={index < 4 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                  className="aspect-square w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                />
              </button>
            </Reveal>
          </li>
        ))}
      </ul>

      {openIndex !== null && (
        <GalleryViewer
          images={images}
          initialIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}

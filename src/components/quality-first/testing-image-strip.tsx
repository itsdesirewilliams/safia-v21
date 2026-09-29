"use client";

import { useState } from "react";

import { GalleryViewer } from "@/components/gallery/gallery-viewer";
import type { GalleryImage } from "@/lib/media/gallery";
import type { QualityFirstMachineImage } from "@/lib/media/quality-first";

export type TestingImageStripProps = {
  images: readonly QualityFirstMachineImage[];
};

/**
 * The Quality First "testing floor" images as a horizontal, story-style strip.
 * Each card keeps its image's natural aspect ratio (`h-auto w-full`, never
 * cropped), the strip scrolls horizontally on small screens, and selecting a
 * card opens the existing accessible Gallery viewer (dark backdrop, complete
 * image, close button, Escape, focus trap, reduced-motion friendly). It renders
 * nothing when no images have been supplied, so the page never shows an empty
 * section or a placeholder.
 */
export function TestingImageStrip({ images }: TestingImageStripProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return null;
  }

  const viewerImages: GalleryImage[] = images.map((image) => {
    const caption = image.caption ?? "Safeway Tyre";
    return {
      path: image.path,
      url: image.url,
      caption,
      alt: image.alt ?? caption,
      createdAt: "",
    };
  });

  return (
    <>
      <ul className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((image, index) => {
          const alt = image.alt ?? image.caption ?? "Safeway Tyre testing";

          return (
            <li
              key={image.path}
              className="w-40 shrink-0 snap-start sm:w-52 lg:w-64"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`Open image ${index + 1} of ${images.length}: ${alt}`}
                className="group block w-full overflow-hidden rounded-lg border border-ink-200 bg-ink-100 shadow-soft transition-shadow hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              >
                {/* Natural aspect ratio: the image sets its own height. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={alt}
                  loading={index < 4 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                  className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </button>
            </li>
          );
        })}
      </ul>

      {openIndex !== null && (
        <GalleryViewer
          images={viewerImages}
          initialIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}

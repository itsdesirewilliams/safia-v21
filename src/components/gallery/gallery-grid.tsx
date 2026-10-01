"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { cn } from "@/lib/cn";
import { GALLERY_EMPTY_STATE } from "@/lib/gallery";
import type { GalleryImage } from "@/lib/media/gallery";
import { MOTION, MOTION_OK } from "@/lib/motion/config";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";

import { GalleryViewer } from "./gallery-viewer";

export type GalleryGridProps = {
  images: readonly GalleryImage[];
};

/**
 * Responsive column widths, shared by the Masonry sizer and the items so the
 * library measures one column and positions every item into it:
 * 2 columns on mobile, 3 on tablet, 4 on desktop.
 */
const COLUMN_CLASSES = "w-1/2 sm:w-1/3 lg:w-1/4";

/** The subset of the Masonry instance API this component uses. */
type MasonryInstance = {
  layout: () => void;
  destroy?: () => void;
};

type MasonryConstructor = new (
  element: Element,
  options: Record<string, unknown>,
) => MasonryInstance;

/**
 * The public Gallery — a Pinterest-style cascading Masonry layout using the
 * official `masonry-layout` library (desandro/masonry). Each image keeps its
 * natural aspect ratio (`w-full h-auto`, never cropped or forced square) and is
 * positioned into the shortest column, so portrait, landscape and square images
 * cascade naturally. `percentPosition` keeps columns fluid across breakpoints.
 *
 * Masonry needs the DOM, so it is dynamically imported inside an effect (its UMD
 * entry references `window`), and the layout is re-run on every image load so
 * items are never left overlapping or mis-sized while images stream in.
 */
export function GalleryGrid({ images }: GalleryGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const masonryRef = useRef<MasonryInstance | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  /** Re-run the layout; safe to call before Masonry has initialised. */
  const layout = useCallback(() => {
    masonryRef.current?.layout();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || images.length === 0) {
      return;
    }

    let cancelled = false;

    void import("masonry-layout").then((imported) => {
      // `masonry-layout` is CommonJS; accept either interop shape.
      const Masonry =
        (imported as { default?: MasonryConstructor }).default ??
        (imported as unknown as MasonryConstructor);
      if (cancelled || !containerRef.current || !Masonry) {
        return;
      }

      const instance = new Masonry(containerRef.current, {
        itemSelector: "[data-gallery-item]",
        columnWidth: "[data-gallery-sizer]",
        percentPosition: true,
        transitionDuration: 0,
        resize: true,
      });
      masonryRef.current = instance;

      // Images load after mount, so re-measure when they arrive and when the
      // container width changes (Masonry already listens to window resize).
      const relayout = () => {
        instance.layout();
        // Images change height as they arrive, so keep scroll triggers aligned.
        ScrollTrigger.refresh();
      };
      window.addEventListener("load", relayout);
      const observer =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(relayout)
          : null;
      observer?.observe(containerRef.current);

      cleanupRef.current = () => {
        window.removeEventListener("load", relayout);
        observer?.disconnect();
        instance.destroy?.();
      };
    });

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
      masonryRef.current = null;
    };
  }, [images.length]);

  // Reveal each image as it enters the viewport. Masonry owns the item
  // transform, so we animate opacity/y on the *inner* media span only.
  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>("[data-gallery-reveal]");
      if (els.length === 0) {
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.set(els, { opacity: 0, y: 18 });
        ScrollTrigger.batch(els, {
          start: "top 95%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: MOTION.duration.reveal,
              ease: MOTION.ease.premium,
              stagger: MOTION.stagger.tight,
              overwrite: true,
            }),
        });
        ScrollTrigger.refresh();
      });

      return () => mm.revert();
    },
    { dependencies: [images.length] },
  );

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
      {/* Masonry's container. `relative` positions the absolutely-placed items. */}
      <div ref={containerRef} className="relative">
        {/*
          Zero-height sizer: its width defines one Masonry column. It is not an
          item, so Masonry leaves it in place and it is never visible.
        */}
        <div
          data-gallery-sizer
          aria-hidden="true"
          className={cn(COLUMN_CLASSES, "float-left")}
        />

        {images.map((image, index) => (
          <button
            key={image.path}
            type="button"
            data-gallery-item
            onClick={() => setOpenIndex(index)}
            aria-label={`Open image ${index + 1} of ${images.length}: ${image.caption}`}
            className={cn(
              COLUMN_CLASSES,
              "float-left p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2",
            )}
          >
            <span
              data-gallery-reveal
              className="block overflow-hidden rounded-lg border border-ink-200 bg-ink-100 shadow-soft transition-shadow hover:shadow-card"
            >
              {/* Natural aspect ratio is preserved: no crop, no forced ratio. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt}
                loading={index < 4 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                onLoad={layout}
                className="block h-auto w-full transition-transform duration-500 ease-out hover:scale-[1.03] motion-reduce:transition-none"
              />
            </span>
          </button>
        ))}
      </div>

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

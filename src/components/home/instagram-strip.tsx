"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  INSTAGRAM_DISPLAY_COUNT,
  INSTAGRAM_ROTATE_MS,
  nextInstagramDisplay,
  type InstagramImage,
} from "@/lib/media/instagram";

/**
 * The four local Instagram images, with a quiet rotation: every five minutes a
 * single tile is replaced, in place, while the other three stay exactly where
 * they are. Only the changed tile remounts, so only it cross-fades — the grid
 * never shuffles as a whole.
 */
export function InstagramStrip({
  images,
}: {
  images: readonly InstagramImage[];
}) {
  const [displayed, setDisplayed] = useState<InstagramImage[]>(() =>
    nextInstagramDisplay(images, [], 0),
  );
  const stepRef = useRef(0);
  const canRotate = images.length > INSTAGRAM_DISPLAY_COUNT;

  useEffect(() => {
    if (!canRotate) {
      return;
    }

    const interval = setInterval(() => {
      stepRef.current += 1;
      setDisplayed((current) =>
        nextInstagramDisplay(images, current, stepRef.current),
      );
    }, INSTAGRAM_ROTATE_MS);

    return () => clearInterval(interval);
  }, [canRotate, images]);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {displayed.map((image) => (
        <div
          key={image.url}
          className="relative aspect-[4/5] overflow-hidden rounded-lg bg-ink-100 animate-fade-in motion-reduce:animate-none"
        >
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

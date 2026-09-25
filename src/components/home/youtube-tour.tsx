"use client";

import { useEffect, useRef, useState } from "react";

import { youtubeEmbedUrl } from "@/lib/media/youtube";

export type YouTubeTourProps = {
  id: string;
  title: string;
};

/**
 * The "Take a Tour of Our Industry" embed.
 *
 * The ordinary YouTube player is rendered lazily. Until the section approaches
 * the viewport it stays a normal click-to-play player; once it is near, the
 * embed is upgraded to muted autoplay. If the browser blocks muted autoplay,
 * YouTube's own controls remain, so the visitor can press play — browser
 * autoplay policy is never worked around.
 */
export function YouTubeTour({ id, title }: YouTubeTourProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [approaching, setApproaching] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setApproaching(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full overflow-hidden rounded-card border border-ink-200 bg-ink-950 shadow-card"
    >
      <iframe
        className="absolute inset-0 h-full w-full"
        src={youtubeEmbedUrl(id, { autoplay: approaching, mute: approaching })}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

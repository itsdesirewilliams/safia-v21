"use client";

import { useEffect, useRef, useState } from "react";

import { youtubeEmbedUrl } from "@/lib/media/youtube";

export type YouTubeTourProps = {
  id: string;
  title: string;
};

const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

/**
 * The "Take a Tour of Our Industry" embed.
 *
 * Nothing is requested from YouTube until the section approaches the viewport;
 * until then only a `<noscript>` copy exists, which the browser ignores while
 * scripting is enabled. On approach the ordinary YouTube player loads once and
 * starts muted, so it can autoplay where policy permits. If the browser blocks
 * muted autoplay, YouTube's own controls remain and the visitor can press play —
 * browser autoplay policy is never worked around.
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

  const fallback = `<iframe class="absolute inset-0 h-full w-full" src="${escapeAttribute(
    youtubeEmbedUrl(id),
  )}" title="${escapeAttribute(
    title,
  )}" allow="${escapeAttribute(IFRAME_ALLOW)}" allowfullscreen loading="lazy"></iframe>`;

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full overflow-hidden rounded-lg border border-ink-200 bg-ink-950 shadow-card"
    >
      {approaching ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={youtubeEmbedUrl(id, { autoplay: true })}
          title={title}
          allow={IFRAME_ALLOW}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 [background:radial-gradient(110%_90%_at_75%_0%,color-mix(in_srgb,var(--color-primary)_35%,transparent),transparent_60%),radial-gradient(80%_80%_at_0%_110%,color-mix(in_srgb,var(--color-accent)_16%,transparent),transparent_55%)]"
          />
          <noscript dangerouslySetInnerHTML={{ __html: fallback }} />
        </>
      )}
    </div>
  );
}

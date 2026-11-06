import type { ReactNode } from "react";

import { PatternImage } from "@/components/catalogue/pattern-image";

/**
 * The shared detail-page hero used by tyre patterns, radial patterns and Tubes
 * valves: image treatment, code typography, description and optional badges.
 */
export function CatalogueDetailHero({
  imageSrc,
  imageAlt,
  code,
  description,
  fallbackLabel,
  children,
}: {
  imageSrc: string | null;
  imageAlt: string;
  code: string;
  description: string;
  fallbackLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-5 sm:gap-6">
      <PatternImage
        src={imageSrc}
        alt={imageAlt}
        fallbackLabel={fallbackLabel}
        className="h-28 w-28 shrink-0 sm:h-32 sm:w-32"
      />
      <div className="min-w-0">
        <h2 className="pattern-code-font text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
          {code}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{description}</p>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

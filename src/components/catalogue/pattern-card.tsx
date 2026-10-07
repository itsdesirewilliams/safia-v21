import Link from "next/link";

import { PatternImage } from "@/components/catalogue/pattern-image";
import { ArrowIcon } from "@/components/ui/button";
import { patternSizes } from "@/lib/catalogue/dataset";
import type { NormalizedPattern } from "@/lib/catalogue/normalize";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/url";
import { ROUTES } from "@/lib/routes";

const SIZE_PREVIEW = 4;

/**
 * A single Pattern card for a category listing.
 *
 * Media sits on the left; the text column on the right leads with the Pattern
 * Code (the unique identifier) and shows a bounded preview of the available
 * sizes directly beneath it, so a Pattern with many sizes never grows the card
 * uncontrollably.
 */
export function PatternCard({
  pattern,
  imageUrl = null,
  locale = "en",
  href,
}: {
  pattern: NormalizedPattern;
  imageUrl?: string | null;
  locale?: Locale;
  /** Override the destination (e.g. the TBR range uses its own route tree). */
  href?: string;
}) {
  const sizes = patternSizes(pattern);
  const preview = sizes.slice(0, SIZE_PREVIEW);
  const remaining = sizes.length - preview.length;

  return (
    <Link
      href={
        href ??
        localizedHref(locale, ROUTES.pattern(pattern.categorySlug, pattern.slug))
      }
      className="group flex h-full items-stretch gap-4 rounded-card border border-ink-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-ink-300 hover:shadow-card motion-reduce:hover:translate-y-0"
    >
      <PatternImage
        src={imageUrl}
        alt={pattern.patternCode}
        className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"
      />

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-start justify-between gap-3">
          <h3 className="pattern-code-font min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-ink-950 sm:text-xl">
            {pattern.patternCode}
          </h3>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-colors duration-200 group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
            <ArrowIcon className="h-4 w-4" />
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-600">
          {preview.join(", ")}
          {remaining > 0 ? ` +${remaining} more` : ""}
        </p>
      </div>
    </Link>
  );
}

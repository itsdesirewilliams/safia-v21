import Link from "next/link";

import { ArrowIcon } from "@/components/ui/button";
import { patternSizes } from "@/lib/catalogue/dataset";
import type { NormalizedPattern } from "@/lib/catalogue/normalize";
import { ROUTES } from "@/lib/routes";

const SIZE_PREVIEW = 4;

/** A single Pattern card for a category listing: displayName + pattern code. */
export function PatternCard({ pattern }: { pattern: NormalizedPattern }) {
  const sizes = patternSizes(pattern);
  const preview = sizes.slice(0, SIZE_PREVIEW);
  const remaining = sizes.length - preview.length;

  return (
    <Link
      href={ROUTES.pattern(pattern.categorySlug, pattern.slug)}
      className="group flex h-full flex-col rounded-card border border-ink-200 bg-white p-6 transition duration-300 hover:border-ink-300 hover:shadow-card"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-1 text-xs font-semibold tracking-wide text-ink-600">
          {pattern.patternCode}
        </span>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-colors duration-200 group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
          <ArrowIcon className="h-4 w-4" />
        </span>
      </div>

      <h3 className="text-h3 mt-5 text-ink-950">{pattern.displayName}</h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">
        {preview.join(", ")}
        {remaining > 0 ? ` +${remaining} more` : ""}
      </p>
    </Link>
  );
}

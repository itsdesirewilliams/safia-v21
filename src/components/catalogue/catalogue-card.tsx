import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowIcon } from "@/components/ui/button";

/**
 * The single card used by every catalogue listing. Callers supply their own
 * image box and metadata (sizes for patterns, applications for valves), but the
 * card frame, typography, arrow and interaction feedback stay identical.
 */
export function CatalogueCard({
  href,
  title,
  image,
  meta,
  badges,
  actionLabel = "View sizes",
}: {
  href: string;
  title: string;
  image: ReactNode;
  meta: ReactNode;
  badges?: ReactNode;
  actionLabel?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-card border border-ink-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-ink-300 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 motion-reduce:hover:translate-y-0"
    >
      <div className="flex items-start gap-4">
        <div className="h-24 w-24 shrink-0 sm:h-28 sm:w-28">{image}</div>
        <div className="min-w-0 flex-1">
          <h3 className="pattern-code-font min-w-0 truncate text-lg font-semibold tracking-tight text-ink-950 sm:text-xl">
            {title}
          </h3>
          <div className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-600">
            {meta}
          </div>
          {badges && <div className="mt-3">{badges}</div>}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-100 pt-4 text-sm font-semibold text-brand-700">
        {actionLabel}
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-colors duration-200 group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
          <ArrowIcon className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

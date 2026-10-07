import Link from "next/link";

import {
  searchResultHref,
  type SearchResult,
} from "@/lib/catalogue/search-result";
import { cn } from "@/lib/cn";
import { localizedHref } from "@/lib/i18n/url";
import type { Locale } from "@/lib/i18n/config";

/** A single search hit: Pattern Code, what it is, its sizes and its image-free
 * identity. Shared by the hero dropdown and the `/search` results list so the
 * two never drift apart. */
export function SearchResultRow({
  result,
  locale,
  active = false,
  onSelect,
  onActivate,
  className,
}: {
  result: SearchResult;
  locale?: Locale;
  active?: boolean;
  onSelect?: () => void;
  onActivate?: () => void;
  className?: string;
}) {
  const href = searchResultHref(result);
  const destination = locale ? localizedHref(locale, href) : href;

  return (
    <Link
      href={destination}
      onClick={onSelect}
      onMouseEnter={onActivate}
      className={cn(
        "flex items-start justify-between gap-4 px-5 py-3 transition-colors",
        active ? "bg-ink-50" : "hover:bg-ink-50",
        className,
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink-950">
          {result.displayName}
        </span>
        <span className="mt-0.5 block text-xs text-ink-600">
          {result.categoryDisplayName}
          {result.sizes.length > 0 &&
            ` · ${result.sizes.slice(0, 3).join(", ")}${
              result.sizes.length > 3 ? "…" : ""
            }`}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500/70"
      />
    </Link>
  );
}

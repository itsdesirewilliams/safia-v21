import Link from "next/link";

import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

export type PaginationProps = {
  page: number;
  pageCount: number;
};

function hrefFor(page: number): string {
  return page <= 1 ? ROUTES.blogs : `${ROUTES.blogs}?page=${page}`;
}

/** Simple previous/next pagination for the blog listing. */
export function Pagination({ page, pageCount }: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  const previous = Math.max(1, page - 1);
  const next = Math.min(pageCount, page + 1);

  const itemClass =
    "inline-flex h-11 items-center justify-center rounded-lg border px-5 text-sm font-semibold transition-colors";
  const activeClass = "border-ink-200 bg-white text-ink-900 hover:bg-ink-50";
  const disabledClass = "border-ink-100 bg-ink-50 text-ink-300";

  return (
    <nav
      aria-label="Blog pagination"
      className="mt-12 flex items-center justify-between gap-4"
    >
      {page > 1 ? (
        <Link href={hrefFor(previous)} className={cn(itemClass, activeClass)}>
          ← Newer posts
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(itemClass, disabledClass)}>
          ← Newer posts
        </span>
      )}

      <span className="text-sm text-ink-500">
        Page {page} of {pageCount}
      </span>

      {page < pageCount ? (
        <Link href={hrefFor(next)} className={cn(itemClass, activeClass)}>
          Older posts →
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(itemClass, disabledClass)}>
          Older posts →
        </span>
      )}
    </nav>
  );
}

import Link from "next/link";

import { ArrowIcon } from "@/components/ui/button";
import { CATEGORY_DESCRIPTIONS } from "@/lib/catalogue/categories";
import type { NormalizedCategory } from "@/lib/catalogue/normalize";
import { ROUTES } from "@/lib/routes";

export type CategoryCardProps = {
  category: NormalizedCategory;
};

/** A category range card for the Catalogue page. Tubes is shown, deferred. */
export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={ROUTES.category(category.slug)}
      className="group flex h-full flex-col rounded-card border border-ink-200 bg-white p-6 transition duration-300 hover:border-ink-300 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-h3 text-ink-950">{category.displayName}</h3>
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-colors duration-200 group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
          <ArrowIcon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">
        {CATEGORY_DESCRIPTIONS[category.slug]}
      </p>
    </Link>
  );
}

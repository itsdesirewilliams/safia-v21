import Link from "next/link";

import { CATEGORIES, type CategorySlug } from "@/lib/catalogue/categories";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { localizedHref } from "@/lib/i18n/url";
import { ROUTES } from "@/lib/routes";

/** Cross-links to the other ranges, localized, without inventing relationships. */
export function RelatedCategories({
  locale,
  dict,
  exclude,
}: {
  locale: Locale;
  dict: Dictionary;
  exclude?: CategorySlug;
}) {
  const categories = CATEGORIES.filter((category) => category.slug !== exclude);

  return (
    <nav aria-label={dict.nav.productRanges}>
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink-500">
        {dict.nav.productRanges}
      </h2>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={localizedHref(locale, ROUTES.category(category.slug))}
              className="text-sm font-semibold text-brand-600 underline-offset-4 hover:underline"
            >
              {dict.categories[category.slug]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

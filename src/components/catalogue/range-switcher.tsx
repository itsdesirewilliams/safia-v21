import Link from "next/link";

import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { localizedHref } from "@/lib/i18n/url";
import { ROUTES } from "@/lib/routes";

export type TruckBusRange = "nylon" | "pcr" | "tbr";

/**
 * A compact switcher between the three Truck & Bus ranges. It is navigation,
 * not a marketing section: it tells the customer they are viewing one of the
 * three ranges and lets them move between them. The current range is visibly
 * active. Routes are the existing ones — no new product routes are created.
 */
export function RangeSwitcher({
  active,
  locale,
  dict,
}: {
  active: TruckBusRange;
  locale: Locale;
  dict: Dictionary;
}) {
  const ranges: ReadonlyArray<{
    key: TruckBusRange;
    label: string;
    href: string;
  }> = [
    {
      key: "nylon",
      label: dict.nav.nylon,
      href: localizedHref(locale, ROUTES.category("truck-bus")),
    },
    {
      key: "pcr",
      label: dict.nav.pcr,
      href: localizedHref(locale, ROUTES.pcrSafeway),
    },
    {
      key: "tbr",
      label: dict.nav.tbr,
      href: localizedHref(locale, ROUTES.tbrSafeway),
    },
  ];

  return (
    <nav aria-label={dict.nav.productRanges}>
      <ul className="flex flex-wrap gap-2">
        {ranges.map((range) => {
          const isActive = range.key === active;
          return (
            <li key={range.key}>
              <Link
                href={range.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:text-ink-950",
                )}
              >
                {range.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

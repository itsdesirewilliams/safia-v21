import { ButtonLink } from "@/components/ui/button";

import { localizedHref } from "@/lib/i18n/url";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { ROUTES } from "@/lib/routes";

/**
 * The shared "request a quotation" panel used on category and pattern pages.
 * It reuses the localized enquiry copy already shown on the Tubes range.
 */
export function CatalogueEnquiry({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <div
      data-testid="catalogue-enquiry"
      className="rounded-card border border-ink-200 bg-ink-50 p-8 sm:p-10"
    >
      <h2 className="text-xl font-semibold tracking-tight text-ink-950">
        {dict.common.requestQuotation}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600">
        {dict.contact.inquiryDescription}
      </p>
      <ButtonLink
        href={localizedHref(locale, ROUTES.contactUs)}
        className="mt-6"
      >
        {dict.common.requestQuotation}
      </ButtonLink>
    </div>
  );
}

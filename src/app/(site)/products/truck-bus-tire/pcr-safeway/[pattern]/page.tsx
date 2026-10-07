import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { PatternImage } from "@/components/catalogue/pattern-image";
import { RangeSpecTable } from "@/components/catalogue/range-spec-table";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import {
  getRangePattern,
  rangeApplication,
} from "@/lib/catalogue/range-data";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { languageAlternates, localizedHref } from "@/lib/i18n/url";
import { getPatternImageUrl } from "@/lib/media/pattern-images-server";
import { ROUTES } from "@/lib/routes";

/** Pattern images and locale come from the request, so render on demand. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pattern: string }>;
}) {
  const { pattern: slug } = await params;
  const pattern = getRangePattern("pcr", slug);
  const dict = await getDictionary();
  return {
    title: pattern
      ? `${pattern.patternCode} — ${dict.pcr.title}`
      : dict.pcr.title,
    description: pattern
      ? `Safeway Tyre ${pattern.patternCode} — the sizes and configurations available for this Passenger Car Radial pattern.`
      : undefined,
    alternates: pattern
      ? {
          canonical: localizedHref(
            await getLocale(),
            ROUTES.pcrPattern(pattern.slug),
          ),
          languages: languageAlternates(ROUTES.pcrPattern(pattern.slug)),
        }
      : undefined,
  };
}

/**
 * PCR Pattern detail: the Pattern's variants as a specification table
 * (Size | Application | LI/SR | CC). There are no Variant routes, and no
 * commercial fields are shown.
 */
export default async function PcrPatternPage({
  params,
}: {
  params: Promise<{ pattern: string }>;
}) {
  const { pattern: slug } = await params;
  const pattern = getRangePattern("pcr", slug);

  if (!pattern) {
    notFound();
  }

  const [dict, locale, imageUrl] = await Promise.all([
    getDictionary(),
    getLocale(),
    getPatternImageUrl(pattern.patternCode),
  ]);

  return (
    <div className="bg-white">
      <PageHeader
        containerSize="listing"
        breadcrumb={
          <Breadcrumbs
            items={[
              {
                label: dict.breadcrumbs.catalogue,
                href: localizedHref(locale, ROUTES.catalogue),
              },
              {
                label: dict.categories["truck-bus"],
                href: localizedHref(locale, ROUTES.category("truck-bus")),
              },
              {
                label: dict.nav.pcr,
                href: localizedHref(locale, ROUTES.pcrSafeway),
              },
              { label: pattern.patternCode },
            ]}
          />
        }
        eyebrow={dict.pcr.eyebrow}
        title={pattern.patternCode}
        description={dict.pcr.title}
      />

      <section className="py-16 lg:py-24">
        <Container size="listing">
          <div className="flex items-center gap-5 sm:gap-6">
            <PatternImage
              src={imageUrl}
              alt={pattern.patternCode}
              className="h-28 w-28 shrink-0 sm:h-32 sm:w-32"
            />
            <div className="min-w-0">
              <h2 className="pattern-code-font text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
                {pattern.patternCode}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                {rangeApplication("pcr")}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <RangeSpecTable variants={pattern.variants} />
          </div>
        </Container>
      </section>
    </div>
  );
}

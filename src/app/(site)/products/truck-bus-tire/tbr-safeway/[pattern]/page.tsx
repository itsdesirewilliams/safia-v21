import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CatalogueEnquiry } from "@/components/catalogue/catalogue-enquiry";
import { PatternImage } from "@/components/catalogue/pattern-image";
import { RangeSpecTable } from "@/components/catalogue/range-spec-table";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import {
  getRangePattern,
  rangeApplication,
  rangePatternSizes,
} from "@/lib/catalogue/range-data";
import { getActiveLocale, getDictionary } from "@/lib/i18n/server";
import { localizedHref } from "@/lib/i18n/url";
import { getPatternImageUrl } from "@/lib/media/pattern-images-server";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbSchema,
  productSchema,
} from "@/lib/seo/structured-data";

/** Pattern images and locale come from the request, so render on demand. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pattern: string }>;
}) {
  const { pattern: slug } = await params;
  const pattern = getRangePattern("tbr", slug);

  if (!pattern) {
    return { title: "Pattern" };
  }

  const dict = await getDictionary();
  const sizes = rangePatternSizes(pattern);
  const sizeSummary =
    sizes.length > 0
      ? ` Available sizes: ${sizes.slice(0, 6).join(", ")}${
          sizes.length > 6 ? " and more." : "."
        }`
      : "";

  return pageMetadata({
    title: `${pattern.patternCode} — ${dict.tbr.title}`,
    description: `Safeway Tyre ${pattern.patternCode}, a Truck & Bus Radial pattern.${sizeSummary}`,
    path: ROUTES.tbrPattern(pattern.slug),
  });
}

/**
 * TBR Pattern detail: the Pattern's variants as a specification table
 * (Size | Application | LI/SR | CC). There are no Variant routes, and no
 * commercial fields are shown.
 */
export default async function TbrPatternPage({
  params,
}: {
  params: Promise<{ pattern: string }>;
}) {
  const { pattern: slug } = await params;
  const pattern = getRangePattern("tbr", slug);

  if (!pattern) {
    notFound();
  }

  const [dict, locale, imageUrl] = await Promise.all([
    getDictionary(),
    getActiveLocale(),
    getPatternImageUrl(pattern.patternCode),
  ]);
  const sizes = rangePatternSizes(pattern);
  const patternPath = localizedHref(locale, ROUTES.tbrPattern(pattern.slug));

  return (
    <div className="bg-white">
      <JsonLd
        data={[
          breadcrumbSchema([
            {
              name: dict.breadcrumbs.catalogue,
              path: localizedHref(locale, ROUTES.catalogue),
            },
            {
              name: dict.categories["truck-bus"],
              path: localizedHref(locale, ROUTES.category("truck-bus")),
            },
            {
              name: dict.nav.tbr,
              path: localizedHref(locale, ROUTES.tbrSafeway),
            },
            { name: pattern.patternCode, path: patternPath },
          ]),
          productSchema({
            name: `${pattern.patternCode} — ${dict.tbr.title}`,
            patternCode: pattern.patternCode,
            category: dict.tbr.title,
            path: patternPath,
            description: `Safeway Tyre ${pattern.patternCode}, a Truck & Bus Radial pattern.`,
            imageUrl,
            sizes,
          }),
        ]}
      />
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
                label: dict.nav.tbr,
                href: localizedHref(locale, ROUTES.tbrSafeway),
              },
              { label: pattern.patternCode },
            ]}
          />
        }
        eyebrow={dict.tbr.eyebrow}
        title={pattern.patternCode}
        description={dict.tbr.title}
      />

      <section className="py-16 lg:py-24">
        <Container size="listing">
          <div className="flex items-center gap-5 sm:gap-6">
            <PatternImage
              src={imageUrl}
              alt={
                imageUrl
                  ? `${pattern.patternCode} Truck & Bus Radial tyre pattern`
                  : ""
              }
              className="h-28 w-28 shrink-0 sm:h-32 sm:w-32"
            />
            <div className="min-w-0">
              <h2 className="pattern-code-font text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
                {pattern.patternCode}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                {rangeApplication("tbr")}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <RangeSpecTable variants={pattern.variants} />
          </div>

          <div className="mt-12">
            <CatalogueEnquiry locale={locale} dict={dict} />
          </div>
        </Container>
      </section>
    </div>
  );
}

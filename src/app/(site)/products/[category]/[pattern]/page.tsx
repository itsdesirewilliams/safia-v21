import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CatalogueEnquiry } from "@/components/catalogue/catalogue-enquiry";
import { PatternCard } from "@/components/catalogue/pattern-card";
import { PatternImage } from "@/components/catalogue/pattern-image";
import { RangeSwitcher } from "@/components/catalogue/range-switcher";
import { RelatedCategories } from "@/components/catalogue/related-categories";
import { VariantTable } from "@/components/catalogue/variant-table";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategory } from "@/lib/catalogue/categories";
import {
  getPattern,
  listPatternsByCategory,
  patternSizes,
} from "@/lib/catalogue/dataset";
import { patternEyebrow } from "@/lib/catalogue/pattern-label";
import { getActiveLocale, getDictionary } from "@/lib/i18n/server";
import { localizedHref } from "@/lib/i18n/url";
import { normalizePatternCode } from "@/lib/media/pattern-image-batch";
import {
  getPatternImageUrl,
  listPatternImageUrls,
} from "@/lib/media/pattern-images-server";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbSchema,
  productSchema,
} from "@/lib/seo/structured-data";

/**
 * Pattern images are read from the Media layer at request time, so an uploaded
 * image appears immediately without a rebuild.
 */
export const dynamic = "force-dynamic";

const RELATED_LIMIT = 3;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; pattern: string }>;
}) {
  const { category, pattern } = await params;
  const found = getPattern(category, pattern);

  if (!found) {
    return { title: "Pattern" };
  }

  const dict = await getDictionary();
  const sizes = patternSizes(found);
  const sizeSummary =
    sizes.length > 0
      ? ` Available sizes: ${sizes.slice(0, 6).join(", ")}${
          sizes.length > 6 ? " and more." : "."
        }`
      : "";

  return pageMetadata({
    title: `${found.displayName} (${found.patternCode})`,
    description: `Safeway Tyre ${found.displayName} (${found.patternCode}) in the ${
      dict.categories[found.categorySlug]
    } range.${sizeSummary}`,
    path: ROUTES.pattern(found.categorySlug, found.slug),
  });
}

/**
 * Pattern detail (spec #1 / Ticket #18): the Pattern's Variants as a
 * specification table. There are no Variant routes. The header identifies the
 * exact Pattern selected (Products → Category → Pattern) and the information
 * block above the table carries the Pattern image, its code and its functional
 * or Category name.
 */
export default async function PatternPage({
  params,
}: {
  params: Promise<{ category: string; pattern: string }>;
}) {
  const { category: categorySlug, pattern: patternSlugParam } = await params;
  const category = getCategory(categorySlug);
  const pattern = getPattern(categorySlug, patternSlugParam);

  if (!category || !pattern) {
    notFound();
  }

  const [imageUrl, images, dict, locale] = await Promise.all([
    getPatternImageUrl(pattern.patternCode),
    listPatternImageUrls(),
    getDictionary(),
    getActiveLocale(),
  ]);
  const categoryName = dict.categories[category.slug];
  const eyebrow = patternEyebrow(pattern.displayName, categoryName);
  const sizes = patternSizes(pattern);
  const patternPath = localizedHref(
    locale,
    ROUTES.pattern(category.slug, pattern.slug),
  );

  const related = listPatternsByCategory(category.slug)
    .filter((item) => item.slug !== pattern.slug)
    .slice(0, RELATED_LIMIT);

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
              name: categoryName,
              path: localizedHref(locale, ROUTES.category(category.slug)),
            },
            { name: pattern.patternCode, path: patternPath },
          ]),
          productSchema({
            name: `${pattern.displayName} (${pattern.patternCode})`,
            patternCode: pattern.patternCode,
            category: categoryName,
            path: patternPath,
            description: `Safeway Tyre ${pattern.displayName} pattern ${pattern.patternCode} in the ${categoryName} range.`,
            imageUrl,
            sizes,
          }),
        ]}
      />
      <PageHeader
        breadcrumb={
          <Breadcrumbs
            items={[
              {
                label: dict.breadcrumbs.catalogue,
                href: localizedHref(locale, ROUTES.catalogue),
              },
              {
                label: categoryName,
                href: localizedHref(locale, ROUTES.category(category.slug)),
              },
              { label: pattern.patternCode },
            ]}
          />
        }
        title={pattern.displayName}
        description={`Pattern ${pattern.patternCode} · ${categoryName}`}
      >
        {category.slug === "truck-bus" && (
          <div className="mt-8">
            <RangeSwitcher active="nylon" locale={locale} dict={dict} />
          </div>
        )}
      </PageHeader>

      <section className="py-16 lg:py-24">
        <Container>
          <div className="flex items-center gap-5 sm:gap-6">
            <PatternImage
              src={imageUrl}
              alt={
                imageUrl
                  ? `${pattern.displayName} (${pattern.patternCode}) tyre pattern`
                  : ""
              }
              className="h-28 w-28 shrink-0 sm:h-32 sm:w-32"
            />
            <div className="min-w-0">
              <h2 className="pattern-code-font text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
                {pattern.patternCode}
              </h2>
              <p className="mt-1.5 text-sm text-ink-600">{eyebrow}</p>
            </div>
          </div>

          <div className="mt-8">
            <VariantTable
              variants={pattern.variants}
              labels={
                locale === "en"
                  ? undefined
                  : {
                      size: dict.spec.size,
                      plyRating: dict.spec.plyRating,
                      ttTl: dict.spec.ttTl,
                      application: dict.spec.application,
                      rimWidthInch: dict.spec.rimWidth,
                      tread: dict.spec.tread,
                      tyreType: dict.spec.tyreType,
                    }
              }
            />
          </div>

          <div className="mt-12">
            <CatalogueEnquiry locale={locale} dict={dict} />
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="border-t border-ink-200 bg-white py-16">
          <Container>
            <SectionHeading title={dict.categories[category.slug]} />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <PatternCard
                    pattern={item}
                    locale={locale}
                    imageUrl={
                      images.get(normalizePatternCode(item.patternCode)) ?? null
                    }
                  />
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <RelatedCategories
                locale={locale}
                dict={dict}
                exclude={category.slug}
              />
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CatalogueEnquiry } from "@/components/catalogue/catalogue-enquiry";
import { PatternCard } from "@/components/catalogue/pattern-card";
import { RangeSwitcher } from "@/components/catalogue/range-switcher";
import { RelatedCategories } from "@/components/catalogue/related-categories";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { getCategory } from "@/lib/catalogue/categories";
import { listPatternsByCategory } from "@/lib/catalogue/dataset";
import { categoryDescription } from "@/lib/i18n/category-copy";
import { getActiveLocale, getDictionary } from "@/lib/i18n/server";
import { localizedHref } from "@/lib/i18n/url";
import { normalizePatternCode } from "@/lib/media/pattern-image-batch";
import { listPatternImageUrls } from "@/lib/media/pattern-images-server";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/structured-data";

/**
 * Pattern images live in the Media layer and are associated by Pattern Code at
 * read time, so newly uploaded images appear without a rebuild.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getCategory(slug);

  if (!category) {
    return { title: "Category" };
  }

  const [dict, locale] = await Promise.all([
    getDictionary(),
    getActiveLocale(),
  ]);

  return pageMetadata({
    title: dict.categories[category.slug],
    description: categoryDescription(locale, category.slug),
    path: ROUTES.category(category.slug),
  });
}

/** Category listing (spec #1 / Ticket #18): every Pattern in a Category. */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getCategory(slug);

  if (!category) {
    notFound();
  }

  const patterns = listPatternsByCategory(category.slug);
  const [images, dict, locale] = await Promise.all([
    listPatternImageUrls(),
    getDictionary(),
    getActiveLocale(),
  ]);

  const categoryName = dict.categories[category.slug];
  const categoryPath = localizedHref(locale, ROUTES.category(category.slug));

  return (
    <div className="bg-white">
      <JsonLd
        data={breadcrumbSchema([
          {
            name: dict.breadcrumbs.catalogue,
            path: localizedHref(locale, ROUTES.catalogue),
          },
          { name: categoryName, path: categoryPath },
        ])}
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
              { label: categoryName },
            ]}
          />
        }
        title={categoryName}
        description={categoryDescription(locale, category.slug)}
      >
        {category.slug === "truck-bus" && (
          <div className="mt-8">
            <RangeSwitcher active="nylon" locale={locale} dict={dict} />
          </div>
        )}
      </PageHeader>

      <section className="py-16 lg:py-24">
        <Container size="listing">
          {patterns.length === 0 ? (
            /* A range without its own pattern list is confirmed per order.
               The page stays complete: the range is described, the enquiry
               path is given, and no promise is made about a date. */
            <CatalogueEnquiry locale={locale} dict={dict} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {patterns.map((pattern, index) => (
                <li key={pattern.slug}>
                  <Reveal delay={(index % 3) * 90} className="h-full">
                    <PatternCard
                      pattern={pattern}
                      locale={locale}
                      imageUrl={
                        images.get(normalizePatternCode(pattern.patternCode)) ??
                        null
                      }
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <section className="border-t border-ink-200 bg-white py-14">
        <Container size="listing">
          <RelatedCategories
            locale={locale}
            dict={dict}
            exclude={category.slug}
          />
        </Container>
      </section>

      {patterns.length > 0 && (
        <section className="bg-white pb-20">
          <Container size="listing">
            <CatalogueEnquiry locale={locale} dict={dict} />
          </Container>
        </section>
      )}
    </div>
  );
}

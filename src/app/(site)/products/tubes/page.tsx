import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CatalogueEnquiry } from "@/components/catalogue/catalogue-enquiry";
import { CatalogueSelectionBar } from "@/components/catalogue/catalogue-selection-bar";
import { RelatedCategories } from "@/components/catalogue/related-categories";
import { JsonLd } from "@/components/seo/json-ld";
import { TubesCatalogue } from "@/components/tubes/tubes-catalogue";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { getActiveLocale, getDictionary } from "@/lib/i18n/server";
import { localizedHref } from "@/lib/i18n/url";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/structured-data";

export async function generateMetadata() {
  return pageMetadata({
    title: "Tubes & Flaps",
    description:
      "Browse Safeway Tyre butyl tubes by application, valve type and size, plus the separate Flaps range. Search by size and request one quotation.",
    path: ROUTES.category("tubes"),
  });
}

export default async function TubesPage() {
  const [dict, locale] = await Promise.all([
    getDictionary(),
    getActiveLocale(),
  ]);
  const categoryPath = localizedHref(locale, ROUTES.category("tubes"));

  return (
    <div className="bg-white">
      <JsonLd
        data={breadcrumbSchema([
          {
            name: dict.breadcrumbs.catalogue,
            path: localizedHref(locale, ROUTES.catalogue),
          },
          { name: "Tubes & Flaps", path: categoryPath },
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
              { label: "Tubes & Flaps" },
            ]}
          />
        }
        eyebrow={dict.categories.tubes}
        title="Tubes & Flaps"
        description="Browse butyl tubes by application and valve type, search the complete size list, and select multiple sizes for one quotation. Flaps are listed separately by size."
      />

      <TubesCatalogue />

      <section className="border-t border-ink-200 bg-white py-14">
        <Container size="listing">
          <CatalogueEnquiry locale={locale} dict={dict} />
          <div className="mt-10">
            <RelatedCategories locale={locale} dict={dict} exclude="tubes" />
          </div>
        </Container>
      </section>

      <CatalogueSelectionBar />
    </div>
  );
}

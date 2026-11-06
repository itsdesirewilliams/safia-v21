import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CatalogueDetailHero } from "@/components/catalogue/catalogue-detail-hero";
import { CatalogueEnquiry } from "@/components/catalogue/catalogue-enquiry";
import { CatalogueSelectionBar } from "@/components/catalogue/catalogue-selection-bar";
import { CatalogueSizeTable } from "@/components/catalogue/catalogue-size-table";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { getActiveLocale, getDictionary } from "@/lib/i18n/server";
import { localizedHref } from "@/lib/i18n/url";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbSchema,
  productSchema,
} from "@/lib/seo/structured-data";
import {
  applicationNames,
  getValve,
  listValveSizes,
} from "@/lib/tubes/catalogue";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ valve: string }>;
}) {
  const { valve: slug } = await params;
  const valve = getValve(slug);

  if (!valve) {
    return { title: "Valve" };
  }

  const sizes = listValveSizes(valve.id);
  const summary =
    sizes.length > 0
      ? ` Available sizes: ${sizes
          .slice(0, 6)
          .map((size) => size.originalSize)
          .join(", ")}${sizes.length > 6 ? " and more." : "."}`
      : "";

  return pageMetadata({
    title: `${valve.code} — Tubes & Flaps`,
    description: `Safeway Tyre ${valve.code} tube valve.${summary}`,
    path: ROUTES.tubeValve(valve.id),
  });
}

export default async function TubeValvePage({
  params,
}: {
  params: Promise<{ valve: string }>;
}) {
  const { valve: slug } = await params;
  const valve = getValve(slug);

  if (!valve) {
    notFound();
  }

  const [dict, locale] = await Promise.all([
    getDictionary(),
    getActiveLocale(),
  ]);
  const sizes = listValveSizes(valve.id);
  const applications = applicationNames(valve.applications);
  const path = localizedHref(locale, ROUTES.tubeValve(valve.id));
  const categoryPath = localizedHref(locale, ROUTES.category("tubes"));

  const rows = sizes.map((size) => {
    const sizeApplications = applicationNames(size.applicationSlugs);
    return {
      id: size.originalSize,
      size: size.originalSize,
      cells: {
        size: size.originalSize,
        application: sizeApplications.join(", ") || null,
      },
      applications: sizeApplications,
    };
  });

  return (
    <div className="bg-white">
      <JsonLd
        data={[
          breadcrumbSchema([
            {
              name: dict.breadcrumbs.catalogue,
              path: localizedHref(locale, ROUTES.catalogue),
            },
            { name: "Tubes & Flaps", path: categoryPath },
            { name: valve.code, path },
          ]),
          productSchema({
            name: `${valve.code} tube valve`,
            patternCode: valve.code,
            category: "Tubes & Flaps",
            path,
            description: `Safeway Tyre ${valve.code} butyl tube valve.`,
            imageUrl: valve.imagePath,
            sizes: sizes.map((size) => size.originalSize),
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
              { label: "Tubes & Flaps", href: categoryPath },
              { label: valve.code },
            ]}
          />
        }
        eyebrow={dict.categories.tubes}
        title={valve.code}
        description="Tube valve · Tubes & Flaps"
      />

      <section className="py-16 lg:py-24">
        <Container size="listing">
          <CatalogueDetailHero
            imageSrc={valve.imagePath}
            imageAlt={`${valve.code} valve`}
            fallbackLabel="Valve image pending"
            code={valve.code}
            description={`${applications.join(", ")} · ${sizes.length} available ${
              sizes.length === 1 ? "size" : "sizes"
            }`}
          >
            <span className="flex flex-wrap gap-1">
              {applications.map((application) => (
                <span
                  key={application}
                  className="rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-[10px] font-medium text-ink-600"
                >
                  {application}
                </span>
              ))}
            </span>
          </CatalogueDetailHero>

          <div className="mt-8">
            <CatalogueSizeTable
              columns={[
                { key: "size", label: "Size", shortLabel: "Size" },
                {
                  key: "application",
                  label: "Application",
                  shortLabel: "App.",
                },
              ]}
              rows={rows}
              selectionContext={{
                kind: "tube",
                categoryKey: "tubes",
                categoryLabel: "Tubes & Flaps",
                productCode: valve.code,
              }}
              caption={`Available sizes for ${valve.code}`}
              searchPlaceholder="Search sizes for this valve"
              emptyLabel="No size in this valve matches that search."
            />
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-500">
            Sizes are shown exactly as published in the Safeway catalogue. Selecting a
            size adds it to your quotation list; it does not confirm stock.
            {valve.sourceTexts.length > 0 && (
              <> Source valve text: {valve.sourceTexts[0]}.</>
            )}
          </p>

          <div className="mt-12">
            <CatalogueEnquiry locale={locale} dict={dict} />
          </div>
        </Container>
      </section>

      <CatalogueSelectionBar />
    </div>
  );
}

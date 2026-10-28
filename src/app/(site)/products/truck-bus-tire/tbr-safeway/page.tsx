import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { CatalogueEnquiry } from "@/components/catalogue/catalogue-enquiry";
import { PatternCard } from "@/components/catalogue/pattern-card";
import { RangeCatalogueSlider } from "@/components/catalogue/range-catalogue-slider";
import { RangeSwitcher } from "@/components/catalogue/range-switcher";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  HIDDEN_TBR_PATTERN_CODES,
  listRangePatterns,
  rangePatternToNormalized,
} from "@/lib/catalogue/range-data";
import { getActiveLocale, getDictionary } from "@/lib/i18n/server";
import { localizedHref } from "@/lib/i18n/url";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/structured-data";
import { normalizePatternCode } from "@/lib/media/pattern-image-batch";
import { listPatternImageUrls } from "@/lib/media/pattern-images-server";
import { readRangeCatalogueLandscapeImages } from "@/lib/media/range-catalogue-assets";
import { ROUTES } from "@/lib/routes";

/** Pattern images come from the request-scoped media layer, so render on demand. */
export const dynamic = "force-dynamic";


export async function generateMetadata() {
  const dict = await getDictionary();
  return pageMetadata({
    title: dict.tbr.title,
    description: dict.tbr.description,
    path: ROUTES.tbrSafeway,
  });
}

/**
 * TBR Safeway — the Truck & Bus Radial range page.
 *
 * Hero → landscape catalogue → Pattern Code cards → manufacturing. The Pattern
 * Codes and sizes come from the normalized TBR dataset
 * (`src/lib/catalogue/data/tbr.json`). The existing Nylon Truck & Bus page is
 * untouched.
 */
export default async function TbrSafewayPage() {
  const [dict, locale, images] = await Promise.all([
    getDictionary(),
    getActiveLocale(),
    listPatternImageUrls(),
  ]);
  const catalogueImages = readRangeCatalogueLandscapeImages("tbr");
  const patterns = listRangePatterns("tbr").filter(
    (pattern) => !HIDDEN_TBR_PATTERN_CODES.has(pattern.patternCode),
  );

  return (
    <div className="bg-white">
      <JsonLd
        data={breadcrumbSchema([
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
              {
                label: dict.categories["truck-bus"],
                href: localizedHref(locale, ROUTES.category("truck-bus")),
              },
              { label: dict.nav.tbr },
            ]}
          />
        }
        eyebrow={dict.tbr.eyebrow}
        title={dict.tbr.title}
        description={dict.tbr.description}
      >
        <div className="mt-8">
          <RangeSwitcher active="tbr" locale={locale} dict={dict} />
        </div>
      </PageHeader>

      {/* Landscape catalogue (no portrait/mobile variant) */}
      <section className="bg-white py-16 lg:py-24">
        <Container size="listing">
          <SectionHeading
            title={dict.tbr.catalogueHeading}
            description={dict.tbr.catalogueDescription}
          />
          <div className="mt-10">
            {catalogueImages.length > 0 ? (
              <RangeCatalogueSlider
                slides={catalogueImages}
                label={dict.tbr.catalogueHeading}
              />
            ) : (
              <PlaceholderPanel
                kind="media"
                label={dict.tbr.catalogueHeading}
                detail={dict.tbr.catalogueDescription}
              />
            )}
          </div>
        </Container>
      </section>

      {/* Pattern Codes (Pattern Code is the primary entity; sizes are variants) */}
      <section className="bg-ink-50 py-16 lg:py-24">
        <Container size="listing">
          <SectionHeading
            title={dict.tbr.patternsHeading}
            description={dict.tbr.patternsDescription}
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patterns.map((pattern, index) => (
              <li key={pattern.patternCode}>
                <Reveal delay={(index % 3) * 90} className="h-full">
                  <PatternCard
                    pattern={rangePatternToNormalized(pattern)}
                    locale={locale}
                    imageUrl={
                      images.get(normalizePatternCode(pattern.patternCode)) ??
                      null
                    }
                    href={localizedHref(
                      locale,
                      ROUTES.tbrPattern(pattern.slug),
                    )}
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Manufacturing relationship (India Nylon vs Shandong radial) */}
      <section className="bg-white py-20 lg:py-28">
        <Container size="listing">
          <SectionHeading
            title={dict.tbr.manufacturingHeading}
            description={dict.tbr.manufacturingDescription}
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="rounded-card border border-ink-200 bg-white p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-ink-950">
                {dict.tbr.indiaHeading}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {dict.tbr.indiaBody}
              </p>
            </div>
            <div className="rounded-card border border-ink-200 bg-white p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-ink-950">
                {dict.tbr.chinaHeading}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {dict.tbr.chinaBody}
              </p>
            </div>
          </div>
        </Container>
      </section>
      <section className="bg-ink-50 py-16">
        <Container size="listing">
          <CatalogueEnquiry locale={locale} dict={dict} />
        </Container>
      </section>
    </div>
  );
}

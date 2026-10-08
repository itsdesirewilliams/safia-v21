import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { PatternCard } from "@/components/catalogue/pattern-card";
import { RangeSwitcher } from "@/components/catalogue/range-switcher";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  listRangePatterns,
  rangePatternToNormalized,
} from "@/lib/catalogue/range-data";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { languageAlternates, localizedHref } from "@/lib/i18n/url";
import { normalizePatternCode } from "@/lib/media/pattern-image-batch";
import { listPatternImageUrls } from "@/lib/media/pattern-images-server";
import { readRangeCatalogueLandscapeImage } from "@/lib/media/range-catalogue-assets";
import { ROUTES } from "@/lib/routes";

/** Pattern images come from the request-scoped media layer, so render on demand. */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const dict = await getDictionary();
  return {
    title: `${dict.tbr.title} | ${dict.tbr.eyebrow}`,
    description: dict.tbr.description,
    alternates: {
      canonical: ROUTES.tbrSafeway,
      languages: languageAlternates(ROUTES.tbrSafeway),
    },
  };
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
    getLocale(),
    listPatternImageUrls(),
  ]);
  const catalogueImage = readRangeCatalogueLandscapeImage("tbr");
  const patterns = listRangePatterns("tbr");

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
            {catalogueImage ? (
              <div className="overflow-hidden rounded-card border border-ink-200 bg-white shadow-card">
                {/* Natural ratio preserved: never cropped or forced square. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={catalogueImage}
                  alt={dict.tbr.catalogueHeading}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
              </div>
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
    </div>
  );
}

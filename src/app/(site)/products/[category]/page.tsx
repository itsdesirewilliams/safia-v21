import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { PatternCard } from "@/components/catalogue/pattern-card";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import {
  CATEGORY_DESCRIPTIONS,
  getCategory,
} from "@/lib/catalogue/categories";
import { listPatternsByCategory } from "@/lib/catalogue/dataset";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { languageAlternates, localizedHref } from "@/lib/i18n/url";
import { normalizePatternCode } from "@/lib/media/pattern-image-batch";
import { listPatternImageUrls } from "@/lib/media/pattern-images-server";
import { ROUTES } from "@/lib/routes";

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
  const dict = await getDictionary();
  const name = category ? dict.categories[category.slug] : undefined;
  return {
    title: name ?? "Category",
    description: name
      ? `Safeway Tyre ${name}: every pattern in the range, with the sizes available.`
      : undefined,
    alternates: category
      ? {
          canonical: localizedHref(
            (await getLocale()),
            ROUTES.category(category.slug),
          ),
          languages: languageAlternates(ROUTES.category(category.slug)),
        }
      : undefined,
  };
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
    getLocale(),
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
              { label: dict.categories[category.slug] },
            ]}
          />
        }
        title={dict.categories[category.slug]}
        description={CATEGORY_DESCRIPTIONS[category.slug]}
      />

      <section className="py-16 lg:py-24">
        <Container size="listing">
          {patterns.length === 0 ? (
            <PlaceholderPanel
              kind="media"
              label="Tubes Coming Soon"
              detail="This range is coming soon. Contact us for current availability or specific sizes."
            />
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
    </div>
  );
}

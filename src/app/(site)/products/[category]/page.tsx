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
  return {
    title: category ? category.displayName : "Category",
    description: category
      ? `Safeway Tyre ${category.displayName}: every pattern in the range, with the sizes available.`
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
  const images = await listPatternImageUrls();

  return (
    <div className="bg-white">
      <PageHeader
        containerSize="listing"
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: "Catalogue", href: ROUTES.catalogue },
              { label: category.displayName },
            ]}
          />
        }
        title={category.displayName}
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

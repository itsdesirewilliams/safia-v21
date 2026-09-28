import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { PatternCard } from "@/components/catalogue/pattern-card";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import {
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  getCategory,
} from "@/lib/catalogue/categories";
import { listPatternsByCategory } from "@/lib/catalogue/dataset";
import { ROUTES } from "@/lib/routes";

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.slug }));
}

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

  return (
    <div className="bg-white">
      <PageHeader
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
        <Container>
          {patterns.length === 0 ? (
            <PlaceholderPanel
              kind="media"
              label="Tubes Coming Soon"
              detail="This range is coming soon. Contact us for current availability or specific sizes."
            />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {patterns.map((pattern, index) => (
                <li key={pattern.slug}>
                  <Reveal delay={(index % 3) * 90} className="h-full">
                    <PatternCard pattern={pattern} />
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

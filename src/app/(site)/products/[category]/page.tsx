import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { PatternCard } from "@/components/catalogue/pattern-card";
import { Container } from "@/components/ui/container";
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
      <section className="border-b border-ink-200 bg-ink-50">
        <Container className="py-14 lg:py-20">
          <Breadcrumbs
            items={[
              { label: "Catalogue", href: ROUTES.catalogue },
              { label: category.displayName },
            ]}
          />
          <h1 className="text-h1 mt-6 max-w-3xl text-balance text-ink-950">
            {category.displayName}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pretty text-ink-600">
            {CATEGORY_DESCRIPTIONS[category.slug]}
          </p>
        </Container>
      </section>

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

import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { VariantTable } from "@/components/catalogue/variant-table";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getCategory } from "@/lib/catalogue/categories";
import { CATALOGUE, getPattern } from "@/lib/catalogue/dataset";
import { ROUTES } from "@/lib/routes";

export function generateStaticParams() {
  return CATALOGUE.patterns.map((pattern) => ({
    category: pattern.categorySlug,
    pattern: pattern.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; pattern: string }>;
}) {
  const { category, pattern } = await params;
  const found = getPattern(category, pattern);
  return {
    title: found ? found.displayName : "Pattern",
    description: found
      ? `Safeway Tyre ${found.displayName} (${found.patternCode}) — the sizes and configurations available for this pattern.`
      : undefined,
  };
}

/**
 * Pattern detail (spec #1 / Ticket #18): the Pattern's Variants as a
 * specification table. There are no Variant routes.
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

  const variantCount = pattern.variants.length;

  return (
    <div className="bg-white">
      <section className="border-b border-ink-200 bg-ink-50">
        <Container className="py-14 lg:py-20">
          <Breadcrumbs
            items={[
              { label: "Catalogue", href: ROUTES.catalogue },
              {
                label: category.displayName,
                href: ROUTES.category(category.slug),
              },
              { label: pattern.displayName },
            ]}
          />
          <Eyebrow className="mt-6">{pattern.patternCode}</Eyebrow>
          <h1 className="text-h1 mt-5 max-w-3xl text-balance text-ink-950">
            {pattern.displayName}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pretty text-ink-600">
            {category.displayName} · {variantCount}{" "}
            {variantCount === 1 ? "variant" : "variants"}
          </p>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <h2 className="text-h2 text-ink-950">Specifications</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
            Every size and configuration available for this pattern. Variants
            share this page.
          </p>
          <div className="mt-8">
            <VariantTable variants={pattern.variants} />
          </div>
        </Container>
      </section>
    </div>
  );
}

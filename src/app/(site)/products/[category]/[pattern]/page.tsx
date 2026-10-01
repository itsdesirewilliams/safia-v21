import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/catalogue/breadcrumbs";
import { PatternImage } from "@/components/catalogue/pattern-image";
import { VariantTable } from "@/components/catalogue/variant-table";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { getCategory } from "@/lib/catalogue/categories";
import { getPattern } from "@/lib/catalogue/dataset";
import { patternEyebrow } from "@/lib/catalogue/pattern-label";
import { getPatternImageUrl } from "@/lib/media/pattern-images-server";
import { ROUTES } from "@/lib/routes";

/**
 * Pattern images are read from the Media layer at request time, so an uploaded
 * image appears immediately without a rebuild.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; pattern: string }>;
}) {
  const { category, pattern } = await params;
  const found = getPattern(category, pattern);
  return {
    title: found ? `${found.patternCode} — ${found.displayName}` : "Pattern",
    description: found
      ? `Safeway Tyre ${found.displayName} (${found.patternCode}) — the sizes and configurations available for this pattern.`
      : undefined,
  };
}

/**
 * Pattern detail (spec #1 / Ticket #18): the Pattern's Variants as a
 * specification table. There are no Variant routes. The header identifies the
 * exact Pattern selected (Products → Category → Pattern) and the information
 * block above the table carries the Pattern image, its code and its functional
 * or Category name.
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

  const eyebrow = patternEyebrow(pattern.displayName, category.displayName);
  const imageUrl = await getPatternImageUrl(pattern.patternCode);

  return (
    <div className="bg-white">
      <PageHeader
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: "Catalogue", href: ROUTES.catalogue },
              {
                label: category.displayName,
                href: ROUTES.category(category.slug),
              },
              { label: pattern.patternCode },
            ]}
          />
        }
        title={pattern.displayName}
        description={`Pattern ${pattern.patternCode} · ${category.displayName}`}
      />

      <section className="py-16 lg:py-24">
        <Container>
          <div className="flex items-center gap-5 sm:gap-6">
            <PatternImage
              src={imageUrl}
              alt={`${pattern.patternCode} — ${eyebrow}`}
              className="h-28 w-28 shrink-0 sm:h-32 sm:w-32"
            />
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
                {pattern.patternCode}
              </h2>
              <p className="mt-1.5 text-sm text-ink-600">{eyebrow}</p>
            </div>
          </div>

          <div className="mt-8">
            <VariantTable variants={pattern.variants} />
          </div>
        </Container>
      </section>
    </div>
  );
}

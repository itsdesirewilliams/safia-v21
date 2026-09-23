import { PagePlaceholder } from "@/components/page-placeholder";
import { getCategory } from "@/lib/catalogue/categories";
import { ROUTES } from "@/lib/routes";

export default async function PatternPage({
  params,
}: {
  params: Promise<{ category: string; pattern: string }>;
}) {
  const { category: categorySlug, pattern } = await params;
  const category = getCategory(categorySlug);

  return (
    <PagePlaceholder
      eyebrow={category?.displayName ?? "Pattern detail"}
      title={pattern}
      description="The pattern's specification table of variants is rendered here."
      ticket="Ticket 8 (#18)"
      links={
        category
          ? [
              {
                label: `All ${category.displayName}`,
                href: ROUTES.category(category.slug),
              },
            ]
          : undefined
      }
    />
  );
}

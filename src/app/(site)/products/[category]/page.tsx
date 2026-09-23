import { notFound } from "next/navigation";

import { PagePlaceholder } from "@/components/page-placeholder";
import { CATEGORIES, getCategory } from "@/lib/catalogue/categories";
import { ROUTES } from "@/lib/routes";

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.slug }));
}

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

  return (
    <PagePlaceholder
      eyebrow="Category listing"
      title={category.displayName}
      description={`All ${category.displayName} patterns are listed here.`}
      ticket="Ticket 8 (#18)"
      links={[
        {
          label: "View a sample pattern",
          href: ROUTES.pattern(category.slug, "example-pattern"),
        },
      ]}
    />
  );
}

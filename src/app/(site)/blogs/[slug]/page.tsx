import { PagePlaceholder } from "@/components/page-placeholder";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PagePlaceholder
      eyebrow="Post"
      title={slug}
      description="The article body is rendered here."
      ticket="Ticket 9 (#19)"
    />
  );
}

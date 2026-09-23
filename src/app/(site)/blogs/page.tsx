import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata = { title: "Blogs" };

export default function BlogsPage() {
  return (
    <PagePlaceholder
      eyebrow="Blogs"
      title="Blog"
      description="The paginated list of published posts lives here."
      ticket="Ticket 9 (#19)"
    />
  );
}

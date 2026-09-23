import { PagePlaceholder } from "@/components/page-placeholder";

export const metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <PagePlaceholder
      eyebrow="Gallery"
      title="Gallery"
      description="A responsive image grid with a next/previous viewer lives here."
      ticket="Ticket 11 (#21)"
    />
  );
}

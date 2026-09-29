import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { GALLERY_PAGE } from "@/lib/gallery";
import { listGalleryImages } from "@/lib/media/gallery-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gallery",
  description:
    "A gallery of Safeway Tyre imagery — the ranges we make and the places they run. Select any image to view it larger.",
};

/**
 * The Gallery page (spec #7 / Ticket #21): a public, cascading Masonry layout
 * (official `masonry-layout` library) with a fullscreen viewer. Images are
 * discovered from the `gallery` bucket at read time (ADR-0006 principle); an
 * optional Media record supplies each image's caption and alt, defaulting to
 * "Safeway Tyre". No filtering, search or tagging; media management reuses the
 * Admin-only Media admin.
 */
export default async function GalleryPage() {
  const images = await listGalleryImages();

  return (
    <>
      <PageHeader
        title={GALLERY_PAGE.title}
        description={GALLERY_PAGE.description}
      />

      <section className="bg-white py-14 lg:py-20">
        <Container>
          <GalleryGrid images={images} />
        </Container>
      </section>
    </>
  );
}

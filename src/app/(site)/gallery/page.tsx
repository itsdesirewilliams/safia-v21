import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { getDictionary } from "@/lib/i18n/server";
import { languageAlternates } from "@/lib/i18n/url";
import { listGalleryImages } from "@/lib/media/gallery-server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const dict = await getDictionary();
  return {
    title: dict.gallery.title,
    description: dict.gallery.description,
    alternates: {
      canonical: "/gallery",
      languages: languageAlternates("/gallery"),
    },
  };
}

/**
 * The Gallery page (spec #7 / Ticket #21): a public, cascading Masonry layout
 * (official `masonry-layout` library) with a fullscreen viewer. Images are
 * discovered from the `gallery` bucket at read time (ADR-0006 principle); an
 * optional Media record supplies each image's caption and alt, defaulting to
 * "Safeway Tyre". No filtering, search or tagging; media management reuses the
 * Admin-only Media admin.
 */
export default async function GalleryPage() {
  const [images, dict] = await Promise.all([
    listGalleryImages(),
    getDictionary(),
  ]);

  return (
    <>
      <PageHeader title={dict.gallery.title} description={dict.gallery.description} />

      <section className="bg-white py-14 lg:py-20">
        <Container>
          <GalleryGrid images={images} />
        </Container>
      </section>
    </>
  );
}

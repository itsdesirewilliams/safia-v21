import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GALLERY_PAGE } from "@/lib/gallery";
import { listGalleryImages } from "@/lib/media/gallery-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gallery",
  description:
    "A gallery of Safeway Tyre imagery — the ranges we make and the places they run. Select any image to view it larger.",
};

/**
 * The Gallery page (spec #7 / Ticket #21): a public, regular responsive image
 * grid (not masonry) with a fullscreen viewer. Images are discovered from the
 * `gallery` bucket at read time (ADR-0006 principle); an optional Media record
 * supplies each image's caption and alt, defaulting to "Safeway Tyre". No
 * filtering, search or tagging; media management reuses the Admin-only Media
 * admin.
 */
export default async function GalleryPage() {
  const images = await listGalleryImages();

  return (
    <section className="bg-white py-20 lg:py-28">
      <Container>
        <Eyebrow>{GALLERY_PAGE.eyebrow}</Eyebrow>
        <h1 className="text-h1 mt-6 max-w-3xl text-balance text-ink-950">
          {GALLERY_PAGE.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-ink-600">
          {GALLERY_PAGE.description}
        </p>

        <div className="mt-14">
          <GalleryGrid images={images} />
        </div>
      </Container>
    </section>
  );
}

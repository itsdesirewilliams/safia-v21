import { CategoryCard } from "@/components/catalogue/category-card";
import { CatalogueDownload } from "@/components/catalogue/catalogue-download";
import { CatalogueHero } from "@/components/catalogue/catalogue-hero";
import { ResponsiveSlider } from "@/components/media/responsive-slider";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  CATALOGUE,
  listPatternsByCategory,
} from "@/lib/catalogue/dataset";

export const metadata = {
  title: "Catalogue",
  description:
    "Browse the Safeway Tyre catalogue: the responsive catalogue viewer and every product range, from motorcycle and truck & bus to agriculture, OTR and forklift tyres.",
};

/**
 * The Catalogue page (spec #1 / Ticket #18). The responsive slider is the
 * shared component from Ticket #13, fed by the developer-provided catalogue
 * artwork under `public/assets/{landscape,portrait}/catalogue`; its download
 * action appears when `NEXT_PUBLIC_CATALOGUE_DOWNLOAD_URL` is configured.
 */
export default function CataloguePage() {
  return (
    <>
      <CatalogueHero />

      <section id="catalogue" className="scroll-mt-28 bg-white py-20 lg:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Flip through"
              title="The Safeway Tyre catalogue"
              description="Page through the supplied catalogue artwork. On a phone it switches to the portrait edition; on larger screens, the landscape edition."
            />
          </Reveal>
          <div className="mx-auto mt-12 max-w-5xl">
            <ResponsiveSlider collection="catalogue" showDownload={false} />
            <CatalogueDownload />
          </div>
        </Container>
      </section>

      <section id="ranges" className="scroll-mt-28 bg-ink-50 py-20 lg:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Product ranges"
              title="Browse the catalogue by category"
              description="Every Safeway Tyre range, with its patterns and sizes. Select a range to see the patterns it covers."
            />
          </Reveal>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATALOGUE.categories.map((category, index) => (
              <li key={category.slug}>
                <Reveal delay={(index % 3) * 90} className="h-full">
                  <CategoryCard
                    category={category}
                    patternCount={listPatternsByCategory(category.slug).length}
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}

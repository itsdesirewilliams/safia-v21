import { CategoryCard } from "@/components/catalogue/category-card";
import { CatalogueDownload } from "@/components/catalogue/catalogue-download";
import { ResponsiveSlider } from "@/components/media/responsive-slider";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CATALOGUE } from "@/lib/catalogue/dataset";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { languageAlternates, localizedHref } from "@/lib/i18n/url";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata() {
  const dict = await getDictionary();
  return {
    title: dict.catalogue.title,
    description: dict.catalogue.description,
    alternates: {
      canonical: "/catalogue",
      languages: languageAlternates("/catalogue"),
    },
  };
}

/**
 * The Catalogue page (spec #1 / Ticket #18). The responsive slider is the
 * shared component from Ticket #13, fed by the developer-provided catalogue
 * artwork under `public/assets/catalogue/portrait` — Catalogue ships portrait
 * artwork only, so it is shown at every size and the download action points
 * straight at the supplied PDF.
 */
export default async function CataloguePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <>
      <section id="catalogue" className="scroll-mt-28 bg-white py-20 lg:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              as="h1"
              title={dict.catalogue.browseTitle}
              description={dict.catalogue.description}
            />
          </Reveal>
          <div className="mx-auto mt-12 max-w-xl">
            <ResponsiveSlider collection="catalogue" showDownload={false} />
            <CatalogueDownload />
          </div>
        </Container>
      </section>

      <section id="ranges" className="scroll-mt-28 bg-ink-50 py-20 lg:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              title="Browse the Catalogue by Category"
              description="Every Safeway Tyre range, with its patterns and sizes."
            />
          </Reveal>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATALOGUE.categories.map((category, index) => (
              <li key={category.slug}>
                <Reveal delay={(index % 3) * 90} className="h-full">
                  <CategoryCard
                    category={category}
                    name={dict.categories[category.slug]}
                    href={localizedHref(locale, ROUTES.category(category.slug))}
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

import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

/** Catalogue hero: the page heading and orientation, with no decorative totals. */
export function CatalogueHero() {
  return (
    <section className="bg-ink-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem]">
        <div className="relative overflow-hidden rounded-lg bg-ink-950">
          <div
            aria-hidden="true"
            className="absolute inset-0 [background:radial-gradient(110%_120%_at_88%_0%,rgba(11,99,246,0.42),transparent_58%),radial-gradient(75%_75%_at_0%_115%,rgba(255,106,0,0.2),transparent_55%)]"
          />

          <div className="relative px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <div className="animate-fade-up">
              <h1 className="text-display max-w-3xl text-white">
                The Safeway Tyre Catalogue
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
                Browse our tyre range by application and product category.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="#catalogue" variant="accent" size="lg">
                  View the Catalogue
                  <ArrowIcon className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink
                  href={ROUTES.contactUs}
                  variant="onDark"
                  size="lg"
                >
                  Request a Quotation
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

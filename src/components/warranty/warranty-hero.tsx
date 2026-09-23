import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ROUTES } from "@/lib/routes";
import { WARRANTY_HERO } from "@/lib/warranty";

/** Warranty hero: the policy heading, a short orientation and the key facts. */
export function WarrantyHero() {
  return (
    <section className="bg-ink-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem]">
        <div className="relative overflow-hidden rounded-card bg-ink-950">
          <div
            aria-hidden="true"
            className="absolute inset-0 [background:radial-gradient(110%_120%_at_88%_0%,rgba(11,99,246,0.42),transparent_58%),radial-gradient(75%_75%_at_0%_115%,rgba(255,106,0,0.2),transparent_55%)]"
          />

          <div className="relative px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <div className="animate-fade-up">
              <Eyebrow tone="dark">{WARRANTY_HERO.eyebrow}</Eyebrow>
              <h1 className="text-display mt-6 max-w-3xl text-white">
                {WARRANTY_HERO.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
                {WARRANTY_HERO.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="#definitions" variant="accent" size="lg">
                  Read the terms
                  <ArrowIcon className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink
                  href={ROUTES.contactUs}
                  variant="onDark"
                  size="lg"
                >
                  Start a claim
                </ButtonLink>
              </div>
            </div>

            <dl className="mt-12 grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
              {WARRANTY_HERO.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="animate-fade-up [animation-delay:120ms]"
                >
                  <dt className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    {fact.value}
                  </dt>
                  <dd className="mt-2 max-w-xs text-sm leading-relaxed text-white/60">
                    {fact.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

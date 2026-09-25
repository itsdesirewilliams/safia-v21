import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { QUALITY_FIRST_HERO } from "@/lib/quality-first";

/**
 * Quality First hero. Approved hero video/imagery has not been supplied, so the
 * media panel is a designed, clearly-temporary stand-in rather than old-site or
 * stock material.
 */
export function QualityFirstHero() {
  return (
    <section className="bg-ink-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem]">
        <div className="relative overflow-hidden rounded-lg bg-ink-950">
          <div
            aria-hidden="true"
            className="absolute inset-0 [background:radial-gradient(110%_120%_at_88%_0%,rgba(11,99,246,0.42),transparent_58%),radial-gradient(75%_75%_at_0%_115%,rgba(255,106,0,0.2),transparent_55%)]"
          />

          <div className="relative grid gap-12 px-6 py-14 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-14 lg:py-20">
            <div className="animate-fade-up">
              <h1 className="text-display max-w-3xl text-white">
                {QUALITY_FIRST_HERO.title}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                {QUALITY_FIRST_HERO.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="#stories" variant="accent" size="lg">
                  Watch the stories
                  <ArrowIcon className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="#machines" variant="onDark" size="lg">
                  See the machines
                </ButtonLink>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="relative hidden lg:block"
            >
              <div className="relative aspect-[4/5] max-h-[32rem] overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                <div className="absolute inset-0 [background:radial-gradient(90%_80%_at_70%_15%,rgba(11,99,246,0.35),transparent_60%)]" />
                <svg
                  viewBox="0 0 320 320"
                  fill="none"
                  className="absolute -bottom-16 -right-12 h-80 w-80 text-white/[0.08]"
                >
                  <g stroke="currentColor" strokeWidth="2">
                    <circle cx="160" cy="160" r="60" />
                    <circle cx="160" cy="160" r="92" />
                    <circle cx="160" cy="160" r="124" />
                    <circle cx="160" cy="160" r="156" />
                  </g>
                </svg>
                <div className="absolute inset-x-6 bottom-6">
                  <p className="text-sm font-semibold text-white">
                    On the Testing Floor
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    Where Safeway Tyre tyres are put through their paces. Watch
                    the videos below.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

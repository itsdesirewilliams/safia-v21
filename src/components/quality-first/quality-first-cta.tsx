import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { QUALITY_FIRST_CTA } from "@/lib/quality-first";

/** Closing CTA linking onward to the catalogue and the enquiry form. */
export function QualityFirstCta() {
  return (
    <section className="bg-ink-50 py-20 lg:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-card bg-ink-950 px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
            <div
              aria-hidden="true"
              className="absolute inset-0 [background:radial-gradient(110%_120%_at_90%_0%,rgba(11,99,246,0.4),transparent_58%),radial-gradient(70%_70%_at_0%_110%,rgba(255,106,0,0.18),transparent_55%)]"
            />
            <div className="relative max-w-3xl">
              <SectionHeading
                tone="dark"
                eyebrow={QUALITY_FIRST_CTA.eyebrow}
                title={QUALITY_FIRST_CTA.title}
                description={QUALITY_FIRST_CTA.description}
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink
                  href={QUALITY_FIRST_CTA.primary.href}
                  variant="accent"
                  size="lg"
                >
                  {QUALITY_FIRST_CTA.primary.label}
                  <ArrowIcon className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink
                  href={QUALITY_FIRST_CTA.secondary.href}
                  variant="onDark"
                  size="lg"
                >
                  {QUALITY_FIRST_CTA.secondary.label}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

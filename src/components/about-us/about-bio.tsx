import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ABOUT_BIO } from "@/lib/about-us";

/**
 * The company bio — the first of About Us's three fixed sections. A dark
 * editorial panel carries the heading, the short bio and the approved
 * catalogue figures; the copy lives in `src/lib/about-us.ts`.
 */
export function AboutBio() {
  return (
    <section className="bg-ink-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem]">
        <div className="relative overflow-hidden rounded-card bg-ink-950">
          <div
            aria-hidden="true"
            className="absolute inset-0 [background:radial-gradient(110%_120%_at_88%_0%,rgba(11,99,246,0.42),transparent_58%),radial-gradient(75%_75%_at_0%_115%,rgba(255,106,0,0.2),transparent_55%)]"
          />

          <div className="relative px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
              <div className="animate-fade-up">
                <Eyebrow tone="dark">{ABOUT_BIO.eyebrow}</Eyebrow>
                <h1 className="text-display mt-6 max-w-3xl text-white">
                  {ABOUT_BIO.title}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
                  {ABOUT_BIO.lead}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink
                    href={ABOUT_BIO.primary.href}
                    variant="accent"
                    size="lg"
                  >
                    {ABOUT_BIO.primary.label}
                    <ArrowIcon className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink
                    href={ABOUT_BIO.secondary.href}
                    variant="onDark"
                    size="lg"
                  >
                    {ABOUT_BIO.secondary.label}
                  </ButtonLink>
                </div>
              </div>

              <div className="animate-fade-up space-y-5 [animation-delay:120ms] lg:pt-4">
                {ABOUT_BIO.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-relaxed text-white/70"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

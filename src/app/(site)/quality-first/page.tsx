import { QualityFirstCta } from "@/components/quality-first/quality-first-cta";
import { QualityFirstHero } from "@/components/quality-first/quality-first-hero";
import { StoryRail } from "@/components/quality-first/story-rail";
import { TestingExplanation } from "@/components/quality-first/testing-explanation";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDictionary } from "@/lib/i18n/server";
import { languageAlternates } from "@/lib/i18n/url";
import { listQualityFirstStories } from "@/lib/media/quality-first-server";
import { QUALITY_FIRST_STORY_SECTION } from "@/lib/quality-first";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const dict = await getDictionary();
  return {
    title: dict.qualityFirst.title,
    description: dict.qualityFirst.description,
    alternates: {
      canonical: "/quality-first",
      languages: languageAlternates("/quality-first"),
    },
  };
}

/**
 * The Quality First page (spec #3 / Ticket 5): a hero, the "From the Testing
 * Floor" story-video section, a developer-owned testing explanation, and a
 * closing CTA. The videos are discovered at read time (ADR-0006) from
 * `public/assets/testing/videos` and Supabase Storage; the section shows a
 * labelled empty state when none are supplied. The page carries no testing or
 * machine image content.
 */
export default async function QualityFirstPage() {
  const stories = await listQualityFirstStories();

  return (
    <>
      <QualityFirstHero />

      <section id="stories" className="scroll-mt-28 bg-white py-20 lg:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              title={QUALITY_FIRST_STORY_SECTION.title}
              description={QUALITY_FIRST_STORY_SECTION.description}
            />
          </Reveal>
          <div className="mt-12">
            <StoryRail stories={stories} />
          </div>
        </Container>
      </section>

      <section className="bg-ink-50 py-20 lg:py-28">
        <Container>
          <TestingExplanation />
        </Container>
      </section>

      <QualityFirstCta />
    </>
  );
}

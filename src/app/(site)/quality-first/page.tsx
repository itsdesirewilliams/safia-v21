import { MachineMasonry } from "@/components/quality-first/machine-masonry";
import { QualityFirstCta } from "@/components/quality-first/quality-first-cta";
import { QualityFirstHero } from "@/components/quality-first/quality-first-hero";
import { StoryRail } from "@/components/quality-first/story-rail";
import { TestingExplanation } from "@/components/quality-first/testing-explanation";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  listQualityFirstMachineImages,
  listQualityFirstStories,
} from "@/lib/media/quality-first-server";
import {
  QUALITY_FIRST_MACHINE_SECTION,
  QUALITY_FIRST_STORY_SECTION,
} from "@/lib/quality-first";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quality First",
  description:
    "Safeway Tyre's testing and quality-control process: testing story videos, an explanation of the process, and the machines behind it.",
};

/**
 * The Quality First page (spec #3 / Ticket 5): a fixed three-section structure
 * — story rail, developer-owned testing explanation, machine images — wrapped
 * in a hero and a closing CTA. Story videos and machine images are discovered
 * from Supabase Storage at read time (ADR-0006); no database record is required
 * for media to appear.
 */
export default async function QualityFirstPage() {
  const [stories, machineImages] = await Promise.all([
    listQualityFirstStories(),
    listQualityFirstMachineImages(),
  ]);

  return (
    <>
      <QualityFirstHero />

      <section
        id="stories"
        className="scroll-mt-28 bg-white py-20 lg:py-28"
      >
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={QUALITY_FIRST_STORY_SECTION.eyebrow}
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

      <section
        id="machines"
        className="scroll-mt-28 bg-white py-20 lg:py-28"
      >
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={QUALITY_FIRST_MACHINE_SECTION.eyebrow}
              title={QUALITY_FIRST_MACHINE_SECTION.title}
              description={QUALITY_FIRST_MACHINE_SECTION.description}
            />
          </Reveal>
          <div className="mt-12">
            <MachineMasonry images={machineImages} />
          </div>
        </Container>
      </section>

      <QualityFirstCta />
    </>
  );
}

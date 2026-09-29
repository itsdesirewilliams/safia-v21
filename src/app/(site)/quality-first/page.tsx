import { QualityFirstCta } from "@/components/quality-first/quality-first-cta";
import { QualityFirstHero } from "@/components/quality-first/quality-first-hero";
import { StoryRail } from "@/components/quality-first/story-rail";
import { TestingExplanation } from "@/components/quality-first/testing-explanation";
import { TestingImageStrip } from "@/components/quality-first/testing-image-strip";
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
    "Safeway Tyre's testing and quality-control process: testing-floor images and story videos, an explanation of the process, and the machines behind it.",
};

/**
 * The Quality First page (spec #3 / Ticket 5): a hero, a story-style strip of
 * the testing/machine images, the testing video rail, a developer-owned testing
 * explanation, and a closing CTA. Images and videos are discovered at read time
 * (ADR-0006); the image strip is simply omitted when no images are supplied, so
 * the page never shows an empty section.
 */
export default async function QualityFirstPage() {
  const [stories, machineImages] = await Promise.all([
    listQualityFirstStories(),
    listQualityFirstMachineImages(),
  ]);

  return (
    <>
      <QualityFirstHero />

      {machineImages.length > 0 && (
        <section
          id="testing-images"
          className="scroll-mt-28 bg-white py-20 lg:py-28"
        >
          <Container>
            <Reveal>
              <SectionHeading
                title={QUALITY_FIRST_MACHINE_SECTION.title}
                description={QUALITY_FIRST_MACHINE_SECTION.description}
              />
            </Reveal>
            <div className="mt-12">
              <TestingImageStrip images={machineImages} />
            </div>
          </Container>
        </section>
      )}

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

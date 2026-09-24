import { ResponsiveSlider } from "@/components/media/responsive-slider";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ABOUT_BUSINESS_PROFILE } from "@/lib/about-us";

/**
 * The Business Profile slider — the third of About Us's three fixed sections.
 * It reuses the shared responsive slider (spec #9) pointed at the
 * `business-profile` asset folders, so it switches to portrait artwork below
 * 768px and landscape at or above it without cropping either ratio.
 */
export function AboutBusinessProfile() {
  return (
    <section
      id="business-profile"
      className="scroll-mt-28 bg-ink-50 py-20 lg:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={ABOUT_BUSINESS_PROFILE.eyebrow}
            title={ABOUT_BUSINESS_PROFILE.title}
            description={ABOUT_BUSINESS_PROFILE.description}
          />
        </Reveal>

        <div className="mx-auto mt-12 max-w-5xl">
          <ResponsiveSlider collection="business-profile" />
        </div>
      </Container>
    </section>
  );
}

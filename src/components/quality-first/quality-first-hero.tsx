import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { QUALITY_FIRST_HERO } from "@/lib/quality-first";

/**
 * Quality First page header. The large dark media panel is gone; the page opens
 * with a light header and in-page links to the story and machine sections.
 */
export function QualityFirstHero() {
  return (
    <PageHeader
      title={QUALITY_FIRST_HERO.title}
      description={QUALITY_FIRST_HERO.description}
      actions={
        <>
          <ButtonLink href="#stories" variant="accent" size="lg">
            Watch the stories
            <ArrowIcon className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="#machines" variant="outline" size="lg">
            See the machines
          </ButtonLink>
        </>
      }
    />
  );
}

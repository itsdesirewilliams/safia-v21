import { PageHeader } from "@/components/ui/page-header";
import { QUALITY_FIRST_HERO } from "@/lib/quality-first";

/**
 * Quality First page header. Informational only — the page opens with a light
 * header and no calls to action; the section content follows directly.
 */
export function QualityFirstHero() {
  return (
    <PageHeader
      title={QUALITY_FIRST_HERO.title}
      description={QUALITY_FIRST_HERO.description}
    />
  );
}

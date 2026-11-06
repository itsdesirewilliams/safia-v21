import { CatalogueCard } from "@/components/catalogue/catalogue-card";
import { PatternImage } from "@/components/catalogue/pattern-image";
import { patternSizes } from "@/lib/catalogue/dataset";
import type { NormalizedPattern } from "@/lib/catalogue/normalize";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/url";
import { ROUTES } from "@/lib/routes";

const SIZE_PREVIEW = 4;

/**
 * A single Pattern card for every tyre catalogue listing. The shared
 * CatalogueCard supplies the frame, title, arrow and hover treatment; this
 * wrapper supplies Pattern-specific media and the size preview.
 */
export function PatternCard({
  pattern,
  imageUrl = null,
  locale = "en",
  href,
}: {
  pattern: NormalizedPattern;
  imageUrl?: string | null;
  locale?: Locale;
  /** Override the destination (e.g. the TBR range uses its own route tree). */
  href?: string;
}) {
  const sizes = patternSizes(pattern);
  const preview = sizes.slice(0, SIZE_PREVIEW);
  const remaining = sizes.length - preview.length;

  return (
    <CatalogueCard
      href={
        href ??
        localizedHref(locale, ROUTES.pattern(pattern.categorySlug, pattern.slug))
      }
      title={pattern.patternCode}
      image={
        <PatternImage
          src={imageUrl}
          alt={`${pattern.patternCode} tyre pattern`}
          className="h-full w-full"
        />
      }
      meta={
        <>
          {preview.join(", ")}
          {remaining > 0 ? ` +${remaining} more` : ""}
        </>
      }
    />
  );
}

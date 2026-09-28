import { PageHeader } from "@/components/ui/page-header";
import { ABOUT_BIO } from "@/lib/about-us";

/**
 * The company bio — the first of About Us's three fixed sections. A light
 * page header carries the heading and lead; the supporting paragraphs sit
 * beneath it. The copy lives in `src/lib/about-us.ts`. Informational, not
 * CTA-driven.
 */
export function AboutBio() {
  return (
    <PageHeader title={ABOUT_BIO.title} description={ABOUT_BIO.lead}>
      <div className="mt-8 grid max-w-3xl gap-6 sm:grid-cols-2">
        {ABOUT_BIO.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-base leading-relaxed text-ink-600">
            {paragraph}
          </p>
        ))}
      </div>
    </PageHeader>
  );
}

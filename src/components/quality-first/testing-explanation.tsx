import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import { QUALITY_FIRST_EXPLANATION } from "@/lib/quality-first";

/**
 * The developer-owned testing explanation. Structure only: the copy lives in
 * `src/lib/quality-first.ts` and ships with the code, so it has no admin
 * surface. Specific standards, machine names and certifications are not
 * supplied, so a labelled note stands in rather than inventing them.
 */
export function TestingExplanation() {
  return (
    <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      <Reveal>
        <SectionHeading
          title={QUALITY_FIRST_EXPLANATION.title}
          description={QUALITY_FIRST_EXPLANATION.intro}
        />
      </Reveal>

      <div className="space-y-10">
        {QUALITY_FIRST_EXPLANATION.blocks.map((block, index) => (
          <Reveal key={block.heading} delay={index * 80}>
            <article className="border-t border-ink-200 pt-8">
              <h3 className="text-h3 text-ink-950">{block.heading}</h3>
              <div className="mt-4 space-y-4">
                {block.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-relaxed text-ink-600"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          </Reveal>
        ))}

        <Reveal delay={160}>
          <PlaceholderPanel
            kind="certification"
            label={QUALITY_FIRST_EXPLANATION.note.label}
            detail={QUALITY_FIRST_EXPLANATION.note.detail}
          />
        </Reveal>

        <Reveal delay={200}>
          <nav aria-label="Related pages" className="border-t border-ink-200 pt-8">
            <p className="text-sm font-semibold text-ink-500">Continue</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {QUALITY_FIRST_EXPLANATION.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-800 transition-colors hover:border-brand-600 hover:text-brand-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>
      </div>
    </div>
  );
}

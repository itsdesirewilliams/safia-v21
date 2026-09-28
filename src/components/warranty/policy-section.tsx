import type { PolicySection as PolicySectionModel } from "@/lib/warranty";

import { PolicyBlock } from "./policy-block";

export type PolicySectionProps = {
  section: PolicySectionModel;
};

/**
 * One numbered warranty section followed by its numbered subsections. The
 * layout mirrors technical documentation: a rule above each primary section and
 * an indent rail beside each subsection.
 */
export function PolicySection({ section }: PolicySectionProps) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      className="mt-12 scroll-mt-28 border-t border-ink-200 pt-12 first:mt-0 first:border-t-0 first:pt-0"
    >
      <h2
        id={`${section.id}-heading`}
        className="flex items-baseline gap-3 text-2xl font-bold tracking-tight text-ink-950"
      >
        <span className="tabular-nums text-ink-400">{section.number}</span>
        <span>{section.title}</span>
      </h2>

      {section.blocks.length > 0 && (
        <div className="mt-6 space-y-5">
          {section.blocks.map((block, index) => (
            <PolicyBlock key={index} block={block} />
          ))}
        </div>
      )}

      {section.subsections && section.subsections.length > 0 && (
        <div className="mt-8 space-y-8">
          {section.subsections.map((subsection) => (
            <div
              key={subsection.number}
              className="border-l-2 border-ink-200 pl-5 sm:pl-6"
            >
              <h3 className="text-lg font-semibold text-ink-900">
                <span className="mr-2 tabular-nums text-ink-400">
                  {subsection.number}
                </span>
                {subsection.title}
              </h3>
              <div className="mt-4 space-y-4">
                {subsection.blocks.map((block, index) => (
                  <PolicyBlock key={index} block={block} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

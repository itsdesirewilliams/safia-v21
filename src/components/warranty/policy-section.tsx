import type { PolicySection as PolicySectionModel } from "@/lib/warranty";

import { PolicyBlock } from "./policy-block";

export type PolicySectionProps = {
  section: PolicySectionModel;
};

/**
 * One numbered warranty section, with its optional numbered subsections. Styled
 * as documentation: a plain rule between sections and normal-weight text.
 */
export function PolicySection({ section }: PolicySectionProps) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      className="mt-10 scroll-mt-28 border-t border-ink-200 pt-10 first:mt-0 first:border-t-0 first:pt-0"
    >
      <h2
        id={`${section.id}-heading`}
        className="text-xl font-bold tracking-tight text-ink-950 sm:text-2xl"
      >
        <span className="mr-3 tabular-nums text-ink-400">{section.number}</span>
        {section.title}
      </h2>

      {section.blocks.length > 0 && (
        <div className="mt-4 space-y-4">
          {section.blocks.map((block, index) => (
            <PolicyBlock key={index} block={block} />
          ))}
        </div>
      )}

      {section.subsections && section.subsections.length > 0 && (
        <div className="mt-7 space-y-7">
          {section.subsections.map((subsection) => (
            <div key={subsection.number}>
              <h3 className="text-base font-semibold text-ink-900 sm:text-lg">
                <span className="mr-2.5 tabular-nums text-ink-400">
                  {subsection.number}
                </span>
                {subsection.title}
              </h3>
              <div className="mt-3 space-y-4">
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

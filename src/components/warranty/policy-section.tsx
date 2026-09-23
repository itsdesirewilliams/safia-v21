import { Eyebrow } from "@/components/ui/eyebrow";
import type { PolicySection as PolicySectionModel } from "@/lib/warranty";

import { PolicyBlock } from "./policy-block";

export type PolicySectionProps = {
  section: PolicySectionModel;
};

/** One numbered warranty section, with its optional numbered subsections. */
export function PolicySection({ section }: PolicySectionProps) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      className="scroll-mt-28"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Eyebrow>{section.number}</Eyebrow>
        <h2 id={`${section.id}-heading`} className="text-h2 text-ink-950">
          {section.title}
        </h2>
      </div>

      {section.blocks.length > 0 && (
        <div className="mt-6 space-y-5">
          {section.blocks.map((block, index) => (
            <PolicyBlock key={index} block={block} />
          ))}
        </div>
      )}

      {section.subsections && section.subsections.length > 0 && (
        <div className="mt-8 space-y-10">
          {section.subsections.map((subsection) => (
            <div key={subsection.number}>
              <h3 className="text-h3 text-ink-950">
                <span className="mr-3 text-ink-400">
                  {subsection.number}
                </span>
                {subsection.title}
              </h3>
              <div className="mt-4 space-y-5">
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

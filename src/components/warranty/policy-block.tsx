import type { PolicyBlock as PolicyBlockModel } from "@/lib/warranty";

export type PolicyBlockProps = {
  block: PolicyBlockModel;
};

/** Renders a single block of warranty copy (paragraph, definitions, list or terms). */
export function PolicyBlock({ block }: PolicyBlockProps) {
  switch (block.kind) {
    case "paragraph":
      return (
        <p className="max-w-3xl text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
          {block.text}
        </p>
      );

    case "definitions":
      return (
        <dl className="grid gap-px overflow-hidden rounded-card border border-ink-200 bg-ink-200 sm:grid-cols-2">
          {block.items.map((item) => (
            <div key={item.term} className="bg-white p-5 sm:p-6">
              <dt className="text-eyebrow text-ink-500">{item.term}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-700">
                {item.definition}
              </dd>
            </div>
          ))}
        </dl>
      );

    case "list":
      return (
        <ol className="ml-5 max-w-3xl list-[lower-alpha] space-y-3 text-base leading-relaxed text-ink-600 marker:font-semibold marker:text-ink-400 sm:text-lg">
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ol>
      );

    case "terms":
      return (
        <dl className="divide-y divide-ink-200 overflow-hidden rounded-card border border-ink-200 bg-white">
          {block.rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-1 p-4 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-6 sm:p-5"
            >
              <dt className="text-sm font-semibold text-ink-950">
                {row.label}
              </dt>
              <dd className="text-sm leading-relaxed text-ink-600">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      );
  }
}

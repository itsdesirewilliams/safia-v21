import type { PolicyBlock as PolicyBlockModel } from "@/lib/warranty";

export type PolicyBlockProps = {
  block: PolicyBlockModel;
};

/** Renders a single block of warranty copy (paragraph, definitions, list or terms). */
export function PolicyBlock({ block }: PolicyBlockProps) {
  switch (block.kind) {
    case "paragraph":
      return (
        <p className="max-w-3xl text-base leading-relaxed text-pretty text-ink-700">
          {block.text}
        </p>
      );

    case "definitions":
      return (
        <dl className="max-w-3xl space-y-4">
          {block.items.map((item) => (
            <div key={item.term}>
              <dt className="text-sm font-semibold text-ink-900">
                {item.term}
              </dt>
              <dd className="mt-1 text-base leading-relaxed text-ink-700">
                {item.definition}
              </dd>
            </div>
          ))}
        </dl>
      );

    case "list":
      return (
        <ul className="ml-5 max-w-3xl list-[lower-alpha] space-y-2 text-base leading-relaxed text-ink-700 marker:text-ink-400">
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      );

    case "terms":
      return (
        <dl className="max-w-3xl divide-y divide-ink-200 border-y border-ink-200">
          {block.rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-1 py-3 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6"
            >
              <dt className="text-sm font-semibold text-ink-900">
                {row.label}
              </dt>
              <dd className="text-sm leading-relaxed text-ink-700">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      );
  }
}

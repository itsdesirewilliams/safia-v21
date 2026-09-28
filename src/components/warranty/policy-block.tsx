import type { PolicyBlock as PolicyBlockModel } from "@/lib/warranty";

export type PolicyBlockProps = {
  block: PolicyBlockModel;
};

/** Renders a single block of warranty copy (paragraph, definitions, list or terms). */
export function PolicyBlock({ block }: PolicyBlockProps) {
  switch (block.kind) {
    case "paragraph":
      return (
        <p className="text-base leading-7 text-pretty text-ink-700">
          {block.text}
        </p>
      );

    case "definitions":
      return (
        <dl className="divide-y divide-ink-200 border-y border-ink-200">
          {block.items.map((item) => (
            <div
              key={item.term}
              className="grid gap-1 py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8"
            >
              <dt className="text-sm font-semibold text-ink-950">
                {item.term}
              </dt>
              <dd className="text-base leading-7 text-ink-700">
                {item.definition}
              </dd>
            </div>
          ))}
        </dl>
      );

    case "list":
      return (
        <ul className="space-y-2.5">
          {block.items.map((item) => (
            <li
              key={item}
              className="relative pl-5 text-base leading-7 text-ink-700 before:absolute before:left-0 before:top-[0.65em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-ink-300"
            >
              {item}
            </li>
          ))}
        </ul>
      );

    case "terms":
      return (
        <dl className="divide-y divide-ink-200 border-y border-ink-200">
          {block.rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-1 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8"
            >
              <dt className="text-sm font-semibold text-ink-950">
                {row.label}
              </dt>
              <dd className="text-sm leading-6 text-ink-700">{row.value}</dd>
            </div>
          ))}
        </dl>
      );
  }
}

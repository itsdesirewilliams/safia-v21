import Link from "next/link";

export type Crumb = {
  label: string;
  href?: string;
};

/** A small breadcrumb trail used by the catalogue pages. */
export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-ink-900"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-700">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <span aria-hidden="true" className="text-ink-300">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

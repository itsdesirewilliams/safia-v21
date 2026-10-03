import Link from "next/link";

import { cn } from "@/lib/cn";

export type AdminBreadcrumb = {
  label: string;
  href?: string;
};

export type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: readonly AdminBreadcrumb[];
  actions?: React.ReactNode;
  className?: string;
};

/** The shared admin page header: breadcrumbs, eyebrow, title and quick actions. */
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <header className={cn("border-b border-ink-200 pb-6", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-ink-500">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span aria-hidden="true" className="text-ink-300">
                    /
                  </span>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-ink-900"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-ink-700">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-600">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}

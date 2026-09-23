import Link from "next/link";

import { ROUTES, type NavLink } from "@/lib/routes";

export type PagePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Ticket that will replace this placeholder with the real domain page. */
  ticket?: string;
  links?: readonly NavLink[];
};

export function PagePlaceholder({
  eyebrow,
  title,
  description,
  ticket,
  links,
}: PagePlaceholderProps) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
        <span aria-hidden="true" className="h-px w-8 bg-brand-600" />
        {eyebrow}
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink-950 sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-700">
        {description}
      </p>
      {ticket && (
        <p className="mt-8 inline-flex rounded-full border border-ink-200 bg-ink-50 px-3.5 py-1.5 text-xs font-medium text-ink-700">
          Placeholder — implemented by {ticket}
        </p>
      )}
      {links && links.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-800 transition-colors hover:border-brand-600/50 hover:text-brand-600"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-12">
        <Link
          href={ROUTES.home}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </section>
  );
}

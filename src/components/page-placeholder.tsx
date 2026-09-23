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
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink-950 sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base text-ink-800/80">{description}</p>
      {ticket && (
        <p className="mt-6 inline-flex rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-800">
          Placeholder — implemented by {ticket}
        </p>
      )}
      {links && links.length > 0 && (
        <ul className="mt-8 flex flex-wrap gap-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex rounded-md border border-ink-100 px-4 py-2 text-sm font-medium text-ink-800 transition-colors hover:border-brand-500 hover:text-brand-600"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-10">
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

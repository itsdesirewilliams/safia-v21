import Link from "next/link";

import { CATEGORIES } from "@/lib/catalogue/categories";
import { ROUTES } from "@/lib/routes";
import { SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="border-b border-ink-100 bg-ink-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            Site shell
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-black tracking-tight sm:text-6xl">
            {SITE.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">
            {SITE.tagline}.
          </p>
          <p className="mt-2 text-sm text-white/50">
            Placeholder — the Homepage is implemented by Ticket 2 (#12).
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-ink-950">
          Product categories
        </h2>
        <p className="mt-2 text-sm text-ink-800/70">
          All seven canonical categories are reachable from the shell.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <li key={category.slug}>
              <Link
                href={ROUTES.category(category.slug)}
                className="block rounded-xl border border-ink-100 p-6 transition hover:border-brand-500 hover:shadow-sm"
              >
                <span className="font-display text-lg font-semibold text-ink-950">
                  {category.displayName}
                </span>
                <span className="mt-1 block text-xs text-ink-800/50">
                  /products/{category.slug}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

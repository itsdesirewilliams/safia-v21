import Link from "next/link";

import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
      <p className="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
        <span aria-hidden="true" className="h-px w-8 bg-brand-600" />
        404
        <span aria-hidden="true" className="h-px w-8 bg-brand-600" />
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink-950 sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-700">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href={ROUTES.home}
        className="mt-10 inline-flex rounded-lg bg-ink-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
      >
        Back to home
      </Link>
    </section>
  );
}

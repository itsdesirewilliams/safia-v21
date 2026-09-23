import Link from "next/link";

import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink-950">
        Page not found
      </h1>
      <p className="mt-4 text-ink-800/70">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href={ROUTES.home}
        className="mt-8 inline-flex rounded-md bg-ink-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-800"
      >
        Back to home
      </Link>
    </section>
  );
}

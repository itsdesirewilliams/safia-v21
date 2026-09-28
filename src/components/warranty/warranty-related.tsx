import Link from "next/link";

import { Container } from "@/components/ui/container";
import { WARRANTY_RELATED } from "@/lib/warranty";

function LinkList({
  label,
  links,
}: {
  label: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <nav aria-label={label}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
        {label}
      </p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-ink-700 underline-offset-4 transition-colors hover:text-brand-600 hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Closing documentation footer linking onward to Products and related pages. */
export function WarrantyRelated() {
  return (
    <section className="border-t border-ink-200 bg-white py-14 lg:py-20">
      <Container>
        <h2 className="text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
          {WARRANTY_RELATED.title}
        </h2>

        <div className="mt-8 grid max-w-3xl gap-10 sm:grid-cols-2">
          <LinkList
            label={WARRANTY_RELATED.productsLabel}
            links={WARRANTY_RELATED.products}
          />
          <LinkList label="More" links={WARRANTY_RELATED.links} />
        </div>
      </Container>
    </section>
  );
}

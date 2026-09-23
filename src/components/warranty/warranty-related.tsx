import Link from "next/link";

import { ArrowIcon } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
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
      <p className="text-eyebrow text-ink-500">{label}</p>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-700 transition-colors hover:text-brand-600"
            >
              {link.label}
              <ArrowIcon className="h-4 w-4 text-ink-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-600" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Closing band linking onward to Products, Quality First, Contact Us and Catalogue. */
export function WarrantyRelated() {
  return (
    <section className="bg-ink-50 py-20 lg:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow={WARRANTY_RELATED.eyebrow}
              title={WARRANTY_RELATED.title}
            />
          </Reveal>

          <Reveal delay={120}>
            <div className="grid gap-10 sm:grid-cols-2">
              <LinkList
                label={WARRANTY_RELATED.productsLabel}
                links={WARRANTY_RELATED.products}
              />
              <LinkList label="More" links={WARRANTY_RELATED.links} />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

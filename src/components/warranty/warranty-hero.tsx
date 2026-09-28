import { PageHeader } from "@/components/ui/page-header";
import { WARRANTY_HERO } from "@/lib/warranty";

/**
 * Warranty document header: the strong page title and lead, followed by an
 * at-a-glance set of key figures. No dark panel, gradient or decorative media.
 */
export function WarrantyHero() {
  return (
    <PageHeader
      title={WARRANTY_HERO.title}
      description={WARRANTY_HERO.description}
    >
      <dl className="mt-8 grid gap-x-8 gap-y-5 border-t border-ink-200 pt-6 sm:grid-cols-3">
        {WARRANTY_HERO.facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-base font-semibold text-ink-950">
              {fact.value}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink-500">
              {fact.label}
            </dd>
          </div>
        ))}
      </dl>
    </PageHeader>
  );
}

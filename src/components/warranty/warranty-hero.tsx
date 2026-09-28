import { Container } from "@/components/ui/container";
import { WARRANTY_HERO } from "@/lib/warranty";

/**
 * Warranty header. The policy title, orientation and key figures are set as
 * plain documentation — no hero panel, gradients or oversized type.
 */
export function WarrantyHero() {
  return (
    <header className="border-b border-ink-200 bg-white">
      <Container>
        <div className="pb-10 pt-14 lg:pb-12 lg:pt-20">
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
            {WARRANTY_HERO.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-600">
            {WARRANTY_HERO.description}
          </p>

          <dl className="mt-8 grid gap-6 border-t border-ink-200 pt-6 sm:grid-cols-3">
            {WARRANTY_HERO.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-sm font-semibold text-ink-950">
                  {fact.value}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-ink-500">
                  {fact.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </header>
  );
}

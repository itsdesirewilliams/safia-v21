import { Container } from "@/components/ui/container";
import { PolicySection } from "@/components/warranty/policy-section";
import { PolicyToc } from "@/components/warranty/policy-toc";
import { WarrantyContact } from "@/components/warranty/warranty-contact";
import { WarrantyHero } from "@/components/warranty/warranty-hero";
import { WarrantyRelated } from "@/components/warranty/warranty-related";
import { WARRANTY_SECTIONS } from "@/lib/warranty";

export const metadata = {
  title: "Warranty Policy",
  description:
    "Safeway Tyres' tyre warranty policy: manufacturing-defect coverage, pro-rata wear credit, terms by category, exclusions and the claim procedure.",
};

/**
 * The Warranty page (spec #5 / Ticket #17): a developer-owned, static page.
 * The policy text is reproduced from Safeway Tyre's authorised Warranty Policy
 * page — the one explicit exception to the old-site source rule — and presented
 * with the site design system. No admin surface, no data discovery.
 */
export default function WarrantyPage() {
  return (
    <>
      <WarrantyHero />

      <section className="bg-white">
        <Container>
          <div className="grid gap-10 py-12 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16 lg:py-16">
            <PolicyToc />

            <div className="min-w-0 max-w-3xl">
              {WARRANTY_SECTIONS.map((section) => (
                <PolicySection key={section.id} section={section} />
              ))}
              <WarrantyContact />
            </div>
          </div>
        </Container>
      </section>

      <WarrantyRelated />
    </>
  );
}

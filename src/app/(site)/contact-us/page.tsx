import { ContactAside } from "@/components/contact/contact-aside";
import { ContactForms } from "@/components/contact/contact-forms";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactMap } from "@/components/contact/contact-map";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { getPublicConfig } from "@/lib/config";

export const metadata = {
  title: "Contact Us",
  description:
    "Contact Safeway Tyre — send a product enquiry or feedback, or chat with us directly on WhatsApp.",
};

/**
 * Contact Us (spec #6): a Query form and a Feedback form over one shared
 * submission pipeline, plus the WhatsApp alternative and approved contact
 * details. Submissions are emailed only (ADR-0007) — nothing is stored.
 */
export default function ContactUsPage() {
  const { companyAddress } = getPublicConfig();

  return (
    <>
      <ContactHero />

      <section className="bg-white py-20 lg:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <ContactAside companyAddress={companyAddress} />
            </Reveal>
            <Reveal delay={100}>
              <ContactForms />
            </Reveal>
          </div>
        </Container>
      </section>

      <ContactMap companyAddress={companyAddress} />
    </>
  );
}

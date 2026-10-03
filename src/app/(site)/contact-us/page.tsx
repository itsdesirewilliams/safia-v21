import { ContactAside } from "@/components/contact/contact-aside";
import { ContactForms } from "@/components/contact/contact-forms";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactMap } from "@/components/contact/contact-map";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { detectVisitorCountry } from "@/lib/contact/visitor-country-server";
import { getDictionary } from "@/lib/i18n/server";
import { languageAlternates } from "@/lib/i18n/url";

export async function generateMetadata() {
  const dict = await getDictionary();
  return {
    title: dict.contact.title,
    description: dict.contact.description,
    alternates: {
      canonical: "/contact-us",
      languages: languageAlternates("/contact-us"),
    },
  };
}

/**
 * Contact Us (spec #6): a Query form and a Feedback form over one shared
 * submission pipeline, plus the WhatsApp alternative and approved contact
 * details. Submissions are emailed only (ADR-0007) — nothing is stored.
 */
export default async function ContactUsPage() {
  // Coarse, IP-derived country only; used to pre-select the phone field.
  const detectedCountry = await detectVisitorCountry();

  return (
    <>
      <ContactHero />

      <section className="bg-white py-20 lg:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <ContactAside />
            </Reveal>
            <Reveal delay={100}>
              <ContactForms defaultCountry={detectedCountry ?? undefined} />
            </Reveal>
          </div>
        </Container>
      </section>

      <ContactMap />
    </>
  );
}

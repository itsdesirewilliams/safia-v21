import { Container } from "@/components/ui/container";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export type ContactMapProps = {
  companyAddress: string | null;
};

/**
 * The office map. Rendered only from the approved configured address; when it
 * is absent a labelled placeholder stands in rather than inventing a location.
 */
export function ContactMap({ companyAddress }: ContactMapProps) {
  return (
    <section className="bg-ink-50 py-20 lg:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            title="Find Us on the Map"
            description="Safeway Tyre's corporate office."
          />
        </Reveal>

        <div className="mt-12">
          {companyAddress ? (
            <div className="h-96 overflow-hidden rounded-card border border-ink-200 shadow-card">
              <iframe
                className="h-full w-full"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  companyAddress,
                )}&output=embed`}
                title="Safeway Tyre location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <PlaceholderPanel
              kind="location"
              label="Map Coming Soon"
              detail="Our location map is not available right now. Contact us and we will help you find us."
            />
          )}
        </div>
      </Container>
    </section>
  );
}

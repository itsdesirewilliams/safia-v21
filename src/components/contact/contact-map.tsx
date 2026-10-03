import { ArrowIcon } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  CORPORATE_OFFICE_ADDRESS,
  CORPORATE_OFFICE_MAP_EMBED_URL,
  CORPORATE_OFFICE_MAPS_LINK,
} from "@/lib/site";

/**
 * The corporate-office map, shown on the Contact page.
 *
 * It uses Google's key-free `output=embed` endpoint (no client-side API key, no
 * build-time secret) and always renders — there is no "Map Coming Soon"
 * fallback. A visible link opens the same location in Google Maps.
 */
export function ContactMap() {
  return (
    <section className="bg-ink-50 py-20 lg:py-28">
      <Container>
        <SectionHeading
          title="Find Us on the Map"
          description="Safeway Tyre's corporate office in Ludhiana, India."
        />

        <div className="mt-12">
          <div className="overflow-hidden rounded-card border border-ink-200 bg-white shadow-card">
            <iframe
              className="block h-80 w-full sm:h-96"
              src={CORPORATE_OFFICE_MAP_EMBED_URL}
              title={`Map of ${CORPORATE_OFFICE_ADDRESS}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 px-5 py-4">
              <p className="text-sm text-ink-600">
                {CORPORATE_OFFICE_ADDRESS}
              </p>
              <a
                href={CORPORATE_OFFICE_MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
              >
                Open in Google Maps
                <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

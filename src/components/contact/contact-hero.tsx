import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { SITE } from "@/lib/site";

/** Contact Us hero: a large editorial opener with the primary contact paths. */
export function ContactHero() {
  return (
    <section className="bg-ink-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem]">
        <div className="relative overflow-hidden rounded-lg bg-ink-950">
          <div
            aria-hidden="true"
            className="absolute inset-0 [background:radial-gradient(110%_120%_at_88%_0%,rgba(11,99,246,0.42),transparent_58%),radial-gradient(75%_75%_at_0%_115%,rgba(255,106,0,0.2),transparent_55%)]"
          />

          <div className="relative grid gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16 lg:px-14 lg:py-20">
            <div className="animate-fade-up">
              <h1 className="text-display max-w-2xl text-white">
                Let&rsquo;s Talk.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                Send a query about a tyre or a quotation, share feedback, or
                reach Safeway Tyre directly on WhatsApp. We respond to enquiries
                as quickly as we can.
              </p>
            </div>

            <div className="animate-fade-up [animation-delay:120ms]">
              <div className="rounded-card border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-7">
                <p className="text-sm font-semibold text-white">
                  Prefer WhatsApp?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Chat with Safeway Tyre directly — it is often the fastest way
                  to reach us.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <ButtonLink
                    href={SITE.whatsappUrl}
                    variant="accent"
                    size="md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chat on WhatsApp
                    <ArrowIcon className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink
                    href={`mailto:${SITE.emails.director}`}
                    variant="onDark"
                    size="md"
                  >
                    Email us
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

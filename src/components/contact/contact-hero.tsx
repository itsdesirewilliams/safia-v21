/**
 * Contact Us hero: a large editorial opener. Informational only — the CTA
 * buttons and the WhatsApp prompt live in the dedicated section below.
 */
export function ContactHero() {
  return (
    <section className="bg-ink-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem]">
        <div className="relative overflow-hidden rounded-lg bg-ink-950">
          <div
            aria-hidden="true"
            className="absolute inset-0 [background:radial-gradient(110%_120%_at_88%_0%,rgba(11,99,246,0.42),transparent_58%),radial-gradient(75%_75%_at_0%_115%,rgba(255,106,0,0.2),transparent_55%)]"
          />

          <div className="relative px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <div className="animate-fade-up max-w-3xl">
              <h1 className="text-display text-white">Let&rsquo;s Talk.</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                Send an inquiry about a tyre or a quotation, share feedback, or
                reach Safeway Tyre directly on WhatsApp. We respond to enquiries
                as quickly as we can.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

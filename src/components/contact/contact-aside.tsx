import { ArrowIcon } from "@/components/ui/button";
import { MARKETING_PHONES, PUBLIC_CONTACT_EMAILS, SITE, telHref } from "@/lib/site";

export type ContactAsideProps = {
  companyAddress: string | null;
};

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-ink-200 pt-5">
      <dt className="text-sm font-semibold text-ink-500">{label}</dt>
      <dd className="mt-2 text-sm leading-relaxed text-ink-800">{children}</dd>
    </div>
  );
}

/** Approved contact information and the WhatsApp alternative, shown beside the forms. */
export function ContactAside({ companyAddress }: ContactAsideProps) {
  const factory = SITE.addresses.find(
    (location) => location.label === "Factory",
  );

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-card bg-ink-950 p-7 text-white sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 [background:radial-gradient(120%_120%_at_100%_0%,color-mix(in_srgb,var(--color-accent)_28%,transparent),transparent_58%),radial-gradient(80%_80%_at_0%_110%,color-mix(in_srgb,var(--color-primary)_30%,transparent),transparent_55%)]"
        />
        <div className="relative">
          <p className="text-sm font-semibold text-accent-500">
            Prefer WhatsApp?
          </p>
          <p className="mt-4 text-xl font-bold tracking-tight">
            Chat With Safeway Tyre Directly
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/60">
            Message us for a quick answer on patterns, sizes or availability.
          </p>
          <a
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 inline-flex items-center gap-3 rounded-lg bg-accent-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
          >
            Chat on WhatsApp
            <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
          </a>
        </div>
      </div>

      <dl className="space-y-5">
        <DetailRow label="Email">
          {PUBLIC_CONTACT_EMAILS.map((email) => (
            <span key={email} className="block break-all">
              <a
                href={`mailto:${email}`}
                className="font-semibold text-brand-600 hover:underline"
              >
                {email}
              </a>
            </span>
          ))}
        </DetailRow>

        <DetailRow label="Phone">
          {MARKETING_PHONES.map((phone) => (
            <span key={phone} className="block whitespace-nowrap">
              <a
                href={telHref(phone)}
                className="font-semibold text-ink-900 hover:text-brand-600"
              >
                {phone}
              </a>
            </span>
          ))}
          <span className="block whitespace-nowrap">
            <a
              href={telHref(SITE.phone.primary)}
              className="font-semibold text-ink-900 hover:text-brand-600"
            >
              {SITE.phone.primary}
            </a>
          </span>
        </DetailRow>

        <DetailRow label="Opening hours">
          {SITE.openingHours.days}
          <br />
          {SITE.openingHours.hours}
          <br />
          Closed {SITE.openingHours.closed}
        </DetailRow>

        {companyAddress && (
          <DetailRow label="Corporate Office">{companyAddress}</DetailRow>
        )}

        {factory && (
          <DetailRow label="Factory">
            {factory.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </DetailRow>
        )}
      </dl>
    </div>
  );
}

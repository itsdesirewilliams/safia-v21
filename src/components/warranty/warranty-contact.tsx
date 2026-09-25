import { WARRANTY_CONTACT } from "@/lib/warranty";

/** The "How to get in touch" block that closes the policy. */
export function WarrantyContact() {
  return (
    <section
      aria-labelledby="warranty-contact-heading"
      className="rounded-card border border-ink-200 bg-ink-50 p-6 sm:p-8"
    >
      <h2
        id="warranty-contact-heading"
        className="text-h3 text-ink-950"
      >
        {WARRANTY_CONTACT.title}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600">
        {WARRANTY_CONTACT.intro}
      </p>

      <dl className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-ink-500">Customer Care</dt>
          <dd className="mt-2 text-sm font-semibold text-ink-950">
            {WARRANTY_CONTACT.name}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-500">Email</dt>
          <dd className="mt-2 text-sm">
            <a
              href={`mailto:${WARRANTY_CONTACT.email}`}
              className="font-semibold text-brand-600 underline-offset-4 hover:underline"
            >
              {WARRANTY_CONTACT.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-500">Phone</dt>
          <dd className="mt-2 text-sm">
            <a
              href={`tel:${WARRANTY_CONTACT.phone.replace(/\s/g, "")}`}
              className="font-semibold text-brand-600 underline-offset-4 hover:underline"
            >
              {WARRANTY_CONTACT.phone}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-500">Website</dt>
          <dd className="mt-2 text-sm font-semibold text-ink-950">
            {WARRANTY_CONTACT.website}
          </dd>
        </div>
      </dl>
    </section>
  );
}

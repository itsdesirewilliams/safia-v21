import { WARRANTY_CONTACT } from "@/lib/warranty";

/** The contact block that closes the documented policy. */
export function WarrantyContact() {
  return (
    <section
      aria-labelledby="warranty-contact-heading"
      className="mt-12 border-t border-ink-200 pt-12"
    >
      <h2
        id="warranty-contact-heading"
        className="text-2xl font-bold tracking-tight text-ink-950"
      >
        {WARRANTY_CONTACT.title}
      </h2>
      <p className="mt-4 text-base leading-7 text-ink-700">
        {WARRANTY_CONTACT.intro}
      </p>

      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-ink-500">Customer Care</dt>
          <dd className="mt-1 text-sm text-ink-900">{WARRANTY_CONTACT.name}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-500">Email</dt>
          <dd className="mt-1 text-sm">
            <a
              href={`mailto:${WARRANTY_CONTACT.email}`}
              className="text-brand-600 underline-offset-4 hover:underline"
            >
              {WARRANTY_CONTACT.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-500">Phone</dt>
          <dd className="mt-1 text-sm">
            <a
              href={`tel:${WARRANTY_CONTACT.phone.replace(/\s/g, "")}`}
              className="text-brand-600 underline-offset-4 hover:underline"
            >
              {WARRANTY_CONTACT.phone}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-500">Website</dt>
          <dd className="mt-1 text-sm text-ink-900">{WARRANTY_CONTACT.website}</dd>
        </div>
      </dl>
    </section>
  );
}

import { WARRANTY_CONTACT } from "@/lib/warranty";

/** The "How to get in touch" block that closes the policy, set as documentation. */
export function WarrantyContact() {
  return (
    <section
      aria-labelledby="warranty-contact-heading"
      className="mt-10 border-t border-ink-200 pt-10"
    >
      <h2
        id="warranty-contact-heading"
        className="text-xl font-bold tracking-tight text-ink-950 sm:text-2xl"
      >
        {WARRANTY_CONTACT.title}
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-700">
        {WARRANTY_CONTACT.intro}
      </p>

      <dl className="mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
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

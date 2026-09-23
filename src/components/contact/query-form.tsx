"use client";

import { useActionState } from "react";

import {
  INITIAL_QUERY_FORM_STATE,
  submitQueryForm,
  type QueryFormState,
} from "@/app/(site)/contact-us/actions";
import { buttonStyles } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/catalogue/categories";

const FIELD_CLASS =
  "mt-2 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p className="mt-1.5 text-xs font-medium text-brand-600" role="alert">
      {message}
    </p>
  );
}

export function QueryForm() {
  const [state, formAction, isPending] = useActionState<
    QueryFormState,
    FormData
  >(submitQueryForm, INITIAL_QUERY_FORM_STATE);

  const values = state.values;

  return (
    <form action={formAction} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="query-name"
            className="text-sm font-medium text-ink-950"
          >
            Name <span aria-hidden="true" className="text-brand-600">*</span>
          </label>
          <input
            id="query-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            defaultValue={values?.name}
            aria-invalid={Boolean(state.errors?.name)}
            className={FIELD_CLASS}
          />
          <FieldError message={state.errors?.name} />
        </div>

        <div>
          <label
            htmlFor="query-country"
            className="text-sm font-medium text-ink-950"
          >
            Country <span aria-hidden="true" className="text-brand-600">*</span>
          </label>
          <input
            id="query-country"
            name="country"
            type="text"
            required
            autoComplete="country-name"
            defaultValue={values?.country}
            aria-invalid={Boolean(state.errors?.country)}
            className={FIELD_CLASS}
          />
          <FieldError message={state.errors?.country} />
        </div>

        <div>
          <label
            htmlFor="query-phone"
            className="text-sm font-medium text-ink-950"
          >
            Phone <span aria-hidden="true" className="text-brand-600">*</span>
          </label>
          <input
            id="query-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            defaultValue={values?.phone}
            aria-invalid={Boolean(state.errors?.phone)}
            className={FIELD_CLASS}
          />
          <FieldError message={state.errors?.phone} />
        </div>

        <div>
          <label
            htmlFor="query-category"
            className="text-sm font-medium text-ink-950"
          >
            Category <span aria-hidden="true" className="text-brand-600">*</span>
          </label>
          <select
            id="query-category"
            name="category"
            required
            defaultValue={values?.category ?? ""}
            aria-invalid={Boolean(state.errors?.category)}
            className={FIELD_CLASS}
          >
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.displayName}
              </option>
            ))}
          </select>
          <FieldError message={state.errors?.category} />
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="query-message"
          className="text-sm font-medium text-ink-950"
        >
          Message <span aria-hidden="true" className="text-brand-600">*</span>
        </label>
        <p className="mt-1 text-xs text-ink-500">
          Tell us what you need, including sizes if applicable.
        </p>
        <textarea
          id="query-message"
          name="message"
          required
          rows={4}
          defaultValue={values?.message}
          aria-invalid={Boolean(state.errors?.message)}
          className={FIELD_CLASS}
        />
        <FieldError message={state.errors?.message} />
      </div>

      {/* Honeypot: hidden from users, attractive to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="query-company">Company</label>
        <input
          id="query-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className={buttonStyles("primary", "lg")}
        >
          {isPending ? "Sending…" : "Send Enquiry"}
        </button>

        {state.status === "success" && state.message && (
          <p className="text-sm font-medium text-success-600" role="status">
            {state.message}
          </p>
        )}
        {state.status === "error" && state.message && (
          <p className="text-sm font-medium text-brand-600" role="alert">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

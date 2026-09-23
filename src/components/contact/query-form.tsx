"use client";

import { useActionState } from "react";

import {
  INITIAL_QUERY_FORM_STATE,
  submitQueryForm,
  type QueryFormState,
} from "@/app/contact-us/actions";
import { CATEGORIES } from "@/lib/catalogue/categories";

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p className="mt-1 text-xs font-medium text-brand-600" role="alert">
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
            className="text-sm font-medium text-ink-800"
          >
            Name <span aria-hidden="true">*</span>
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
            className="text-sm font-medium text-ink-800"
          >
            Country <span aria-hidden="true">*</span>
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
            className="text-sm font-medium text-ink-800"
          >
            Phone <span aria-hidden="true">*</span>
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
            className="text-sm font-medium text-ink-800"
          >
            Category <span aria-hidden="true">*</span>
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
          className="text-sm font-medium text-ink-800"
        >
          Message <span aria-hidden="true">*</span>
        </label>
        <p className="text-xs text-ink-800/60">
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

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Sending…" : "Send Enquiry"}
        </button>

        {state.status === "success" && state.message && (
          <p className="text-sm font-medium text-green-700" role="status">
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

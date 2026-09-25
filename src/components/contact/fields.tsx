import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import type { ContactFormState } from "@/lib/contact/form-state";
import { ROUTES } from "@/lib/routes";
import { SITE } from "@/lib/site";

/**
 * Shared presentational primitives for the Contact Us forms (spec #6), so the
 * Query and Feedback forms stay visually and behaviourally identical for the
 * fields they share.
 */

export const FIELD_CLASS =
  "mt-2 w-full rounded-lg border border-ink-200 bg-white px-3.5 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15";

export function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-brand-600">
      *
    </span>
  );
}

export function FieldError({
  id,
  message,
}: {
  id?: string;
  message?: string;
}) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-brand-600" role="alert">
      {message}
    </p>
  );
}

export type TextFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  hint?: string;
};

export function TextField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  required,
  defaultValue,
  error,
  hint,
}: TextFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink-950">
        {label} {required && <RequiredMark />}
      </label>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={FIELD_CLASS}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export type TextAreaFieldProps = {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  hint?: string;
  rows?: number;
};

export function TextAreaField({
  id,
  name,
  label,
  required,
  defaultValue,
  error,
  hint,
  rows = 4,
}: TextAreaFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink-950">
        {label} {required && <RequiredMark />}
      </label>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={FIELD_CLASS}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export type SelectFieldProps = {
  id: string;
  name: string;
  label: string;
  options: readonly { value: string; label: string }[];
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
};

export function SelectField({
  id,
  name,
  label,
  options,
  placeholder,
  required,
  defaultValue,
  error,
}: SelectFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink-950">
        {label} {required && <RequiredMark />}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={FIELD_CLASS}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

/** Invisible to people, attractive to bots; must stay empty. */
export function HoneypotField() {
  return (
    <div className="hidden" aria-hidden="true">
      <label htmlFor="contact-company">Company</label>
      <input
        id="contact-company"
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

/** Inline error message for submission-level failures (rate limit, delivery). */
export function FormStatus({ state }: { state: ContactFormState }) {
  if (state.status !== "error" || !state.message) {
    return null;
  }
  return (
    <p className="text-sm font-medium text-brand-600" role="alert">
      {state.message}
    </p>
  );
}

/** Replaces the form after a successful submission so it cannot be re-sent. */
export function FormSuccess({
  message,
  kind,
}: {
  message: string;
  kind: "query" | "feedback";
}) {
  return (
    <div
      role="status"
      className="rounded-card border border-success-600/25 bg-success-600/[0.06] p-6 sm:p-8"
    >
      <p className="text-lg font-semibold text-ink-950">{message}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-600">
        We have received your{" "}
        {kind === "query" ? "inquiry" : "feedback"}. For an immediate response,
        reach us on WhatsApp or continue browsing the range.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={SITE.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles("accent", "md")}
        >
          Chat on WhatsApp
        </a>
        <Link href={ROUTES.home} className={buttonStyles("outline", "md")}>
          Continue browsing
        </Link>
      </div>
    </div>
  );
}

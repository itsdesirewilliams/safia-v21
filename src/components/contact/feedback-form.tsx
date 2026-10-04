"use client";

import { useActionState, useState } from "react";

import { submitFeedbackForm } from "@/app/(site)/contact-us/actions";
import { buttonStyles } from "@/components/ui/button";
import {
  INITIAL_CONTACT_FORM_STATE,
  type ContactFormState,
} from "@/lib/contact/form-state";

import { CountryPhoneField } from "./country-phone-field";
import {
  FormStatus,
  FormSuccess,
  HoneypotField,
  TextAreaField,
  TextField,
} from "./fields";
import type { ContactFormAction } from "./query-form";

export type FeedbackFormProps = {
  /**
   * Country to pre-select in the phone field, typically detected from the
   * request. Falls back to the first country when absent.
   */
  defaultCountry?: string;
  /** Override the server action (used by tests). */
  action?: ContactFormAction;
};

/**
 * The Feedback form (spec #6): intentionally simpler than the Inquiry form — no
 * Category. Same shared validation, honeypot, rate limiting and email delivery
 * as the Inquiry form.
 */
export function FeedbackForm({
  defaultCountry,
  action = submitFeedbackForm,
}: FeedbackFormProps = {}) {
  const [state, formAction, isPending] = useActionState<
    ContactFormState,
    FormData
  >(action, INITIAL_CONTACT_FORM_STATE);

  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const markDirty = (name: string) =>
    setDirty((current) =>
      current[name] ? current : { ...current, [name]: true },
    );
  const errorFor = (name: string) =>
    dirty[name] ? undefined : state.errors?.[name];

  if (state.status === "success" && state.message) {
    return <FormSuccess message={state.message} kind="feedback" />;
  }

  const values = state.values;

  return (
    <form action={formAction} noValidate onSubmit={() => setDirty({})}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="feedback-name"
          name="name"
          label="Name"
          required
          autoComplete="name"
          defaultValue={values?.name}
          error={errorFor("name")}
          onValueChange={() => markDirty("name")}
        />
        <CountryPhoneField
          idPrefix="feedback"
          countryDefault={values?.country ?? defaultCountry}
          phoneDefault={values?.phone}
          countryError={errorFor("country")}
          phoneError={errorFor("phone")}
          required
          onValueChange={() => {
            markDirty("country");
            markDirty("phone");
          }}
        />
      </div>

      <div className="mt-4">
        <TextAreaField
          id="feedback-message"
          name="message"
          label="Message"
          required
          hint="Share your comments, suggestions or concerns."
          defaultValue={values?.message}
          error={errorFor("message")}
          onValueChange={() => markDirty("message")}
        />
      </div>

      <HoneypotField />

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className={buttonStyles("primary", "lg")}
        >
          {isPending ? "Sending…" : "Send Feedback"}
        </button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}

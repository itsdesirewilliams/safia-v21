"use client";

import { useActionState } from "react";

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

/**
 * The Feedback form (spec #6): intentionally simpler than the Inquiry form — no
 * Category. Same shared validation, honeypot, rate limiting and email delivery
 * as the Inquiry form.
 */
export function FeedbackForm() {
  const [state, formAction, isPending] = useActionState<
    ContactFormState,
    FormData
  >(submitFeedbackForm, INITIAL_CONTACT_FORM_STATE);

  if (state.status === "success" && state.message) {
    return <FormSuccess message={state.message} kind="feedback" />;
  }

  const values = state.values;

  return (
    <form action={formAction} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="feedback-name"
          name="name"
          label="Name"
          required
          autoComplete="name"
          defaultValue={values?.name}
          error={state.errors?.name}
        />
        <CountryPhoneField
          idPrefix="feedback"
          countryDefault={values?.country}
          phoneDefault={values?.phone}
          countryError={state.errors?.country}
          phoneError={state.errors?.phone}
          required
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
          error={state.errors?.message}
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

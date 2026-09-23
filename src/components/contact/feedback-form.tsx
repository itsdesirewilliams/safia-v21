"use client";

import { useActionState } from "react";

import { submitFeedbackForm } from "@/app/(site)/contact-us/actions";
import { buttonStyles } from "@/components/ui/button";
import {
  INITIAL_CONTACT_FORM_STATE,
  type ContactFormState,
} from "@/lib/contact/form-state";

import {
  FormStatus,
  FormSuccess,
  HoneypotField,
  TextAreaField,
  TextField,
} from "./fields";

/**
 * The Feedback form (spec #6): intentionally simpler than the Query form — no
 * Category. Same shared validation, honeypot, rate limiting and email
 * delivery as the Query form.
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
        <TextField
          id="feedback-country"
          name="country"
          label="Country"
          required
          autoComplete="country-name"
          defaultValue={values?.country}
          error={state.errors?.country}
        />
        <TextField
          id="feedback-phone"
          name="phone"
          label="Phone"
          type="tel"
          required
          autoComplete="tel"
          defaultValue={values?.phone}
          error={state.errors?.phone}
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

      <div className="mt-7 flex flex-wrap items-center gap-4">
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

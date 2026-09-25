"use client";

import { useActionState } from "react";

import { submitQueryForm } from "@/app/(site)/contact-us/actions";
import { buttonStyles } from "@/components/ui/button";
import {
  INITIAL_CONTACT_FORM_STATE,
  type ContactFormState,
} from "@/lib/contact/form-state";

import { CategoryCheckboxes } from "./category-checkboxes";
import { CountryPhoneField } from "./country-phone-field";
import {
  FormStatus,
  FormSuccess,
  HoneypotField,
  TextAreaField,
  TextField,
} from "./fields";

/**
 * The Inquiry form (spec #6). The single implementation used on both the
 * Contact Us page and the homepage, so the two behave identically.
 */
export function QueryForm() {
  const [state, formAction, isPending] = useActionState<
    ContactFormState,
    FormData
  >(submitQueryForm, INITIAL_CONTACT_FORM_STATE);

  if (state.status === "success" && state.message) {
    return <FormSuccess message={state.message} kind="query" />;
  }

  const values = state.values;

  return (
    <form action={formAction} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="query-name"
          name="name"
          label="Name"
          required
          autoComplete="name"
          defaultValue={values?.name}
          error={state.errors?.name}
        />
        <CountryPhoneField
          idPrefix="query"
          countryDefault={values?.country}
          phoneDefault={values?.phone}
          countryError={state.errors?.country}
          phoneError={state.errors?.phone}
          required
        />
      </div>

      <div className="mt-4">
        <CategoryCheckboxes
          idPrefix="query"
          defaultSelected={values?.categories}
          error={state.errors?.categories}
          required
        />
      </div>

      <div className="mt-4">
        <TextAreaField
          id="query-message"
          name="message"
          label="Message"
          required
          hint="Tell us what you need, including sizes if applicable."
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
          {isPending ? "Sending…" : "Send Inquiry"}
        </button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}

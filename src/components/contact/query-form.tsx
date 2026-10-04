"use client";

import { useActionState, useState } from "react";

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

/** The shape of a contact-form server action (injectable for tests). */
export type ContactFormAction = (
  state: ContactFormState,
  formData: FormData,
) => Promise<ContactFormState>;

export type QueryFormProps = {
  /**
   * Country to pre-select in the phone field, typically detected from the
   * request. Falls back to the first country when absent.
   */
  defaultCountry?: string;
  /** Override the server action (used by tests). */
  action?: ContactFormAction;
};

/**
 * The Inquiry form (spec #6). The single implementation used on both the
 * Contact Us page and the homepage, so the two behave identically.
 */
export function QueryForm({
  defaultCountry,
  action = submitQueryForm,
}: QueryFormProps = {}) {
  const [state, formAction, isPending] = useActionState<
    ContactFormState,
    FormData
  >(action, INITIAL_CONTACT_FORM_STATE);

  // Fields the visitor has edited since the last submit. Their stale server
  // errors are hidden as soon as the field changes, and cleared on submit.
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const markDirty = (name: string) =>
    setDirty((current) =>
      current[name] ? current : { ...current, [name]: true },
    );
  const errorFor = (name: string) =>
    dirty[name] ? undefined : state.errors?.[name];

  if (state.status === "success" && state.message) {
    return <FormSuccess message={state.message} kind="query" />;
  }

  const values = state.values;

  return (
    <form action={formAction} noValidate onSubmit={() => setDirty({})}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="query-name"
          name="name"
          label="Name"
          required
          autoComplete="name"
          defaultValue={values?.name}
          error={errorFor("name")}
          onValueChange={() => markDirty("name")}
        />
        <CountryPhoneField
          idPrefix="query"
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
        <CategoryCheckboxes
          idPrefix="query"
          defaultSelected={values?.categories}
          error={errorFor("categories")}
          required
          onValueChange={() => markDirty("categories")}
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
          error={errorFor("message")}
          onValueChange={() => markDirty("message")}
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

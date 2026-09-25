/**
 * Shared result shape for the Contact Us forms (spec #6). Kept outside the
 * `"use server"` action module because such modules may only export async
 * functions, and both the Query and Feedback forms consume it.
 */

export type ContactFormKind = "query" | "feedback";

export type ContactFormValues = {
  name: string;
  /** ISO country code, so the country dropdown can restore its selection. */
  country: string;
  /** The national number as typed; the dialing code is restored separately. */
  phone: string;
  /** Selected category slugs (Inquiry form only). */
  categories?: string[];
  message: string;
};

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: ContactFormValues;
};

export const INITIAL_CONTACT_FORM_STATE: ContactFormState = { status: "idle" };

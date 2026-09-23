"use server";

import { headers } from "next/headers";

import { sendContactEmail } from "@/lib/contact/email";
import type { ContactFormState } from "@/lib/contact/form-state";
import { checkRateLimit } from "@/lib/contact/rate-limit";
import { processContactSubmission } from "@/lib/contact/submit";

/**
 * Server actions for the Contact Us forms (spec #6 / ADR-0007). Both forms
 * share one pipeline: server-side validation, honeypot, rate limiting and
 * email-only delivery to Safeway's two fixed addresses. Nothing is persisted.
 */

function formDataToRecord(formData: FormData): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      record[key] = value;
    }
  }
  // The honeypot is rendered under an innocuous name; map it to the
  // validation contract's `honeypot` field.
  record.honeypot = record.company ?? "";
  return record;
}

async function clientKey(): Promise<string> {
  const forwardedFor = (await headers()).get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export async function submitQueryForm(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  return processContactSubmission(
    "query",
    formDataToRecord(formData),
    await clientKey(),
    {
      send: (submission) => sendContactEmail(submission),
      allow: checkRateLimit,
    },
  );
}

export async function submitFeedbackForm(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  return processContactSubmission(
    "feedback",
    formDataToRecord(formData),
    await clientKey(),
    {
      send: (submission) => sendContactEmail(submission),
      allow: checkRateLimit,
    },
  );
}

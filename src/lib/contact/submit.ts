import { ConfigError } from "@/lib/config";

import type { ContactSubmission } from "./email";
import type {
  ContactFormKind,
  ContactFormState,
  ContactFormValues,
} from "./form-state";
import { validateFeedbackForm, validateQueryForm } from "./validation";

/**
 * The shared submission pipeline for both Contact Us forms (spec #6). It is
 * deliberately free of Next.js request APIs and the email transport so the
 * whole flow — validation, honeypot, rate limiting, delivery and error
 * mapping — can be tested with injected dependencies. The server action only
 * supplies the request data and the real implementations.
 */

export type ContactSubmissionDeps = {
  /** Deliver the normalized submission (email-only, per ADR-0007). */
  send: (submission: ContactSubmission) => Promise<void>;
  /** Return false when the caller is over the rate limit. */
  allow: (key: string) => boolean;
};

type ContactMessages = {
  success: string;
  unavailable: string;
  failure: string;
};

const MESSAGES: Record<ContactFormKind, ContactMessages> = {
  query: {
    success: "Thank you — your enquiry has been sent to Safeway Tyre.",
    unavailable:
      "Online enquiries are temporarily unavailable. Please reach us on WhatsApp or by email.",
    failure:
      "We couldn't send your enquiry just now. Please try again or reach us on WhatsApp.",
  },
  feedback: {
    success: "Thank you — your feedback has been sent to Safeway Tyre.",
    unavailable:
      "Online feedback is temporarily unavailable. Please reach us on WhatsApp or by email.",
    failure:
      "We couldn't send your feedback just now. Please try again or reach us on WhatsApp.",
  },
};

const RATE_LIMIT_MESSAGE =
  "Too many submissions. Please try again in a minute.";

function readValues(
  input: Record<string, unknown>,
  kind: ContactFormKind,
): ContactFormValues {
  const read = (key: string) =>
    typeof input[key] === "string" ? (input[key] as string) : "";

  return {
    name: read("name"),
    country: read("country"),
    phone: read("phone"),
    message: read("message"),
    ...(kind === "query" ? { category: read("category") } : {}),
  };
}

export async function processContactSubmission(
  kind: ContactFormKind,
  input: Record<string, unknown>,
  clientKey: string,
  deps: ContactSubmissionDeps,
): Promise<ContactFormState> {
  const validation =
    kind === "query" ? validateQueryForm(input) : validateFeedbackForm(input);

  if (!validation.ok) {
    return {
      status: "error",
      errors: validation.errors,
      values: readValues(input, kind),
    };
  }

  const value = validation.value;

  // Honeypot tripped: report success so bots learn nothing.
  if (value.honeypot !== "") {
    return { status: "success", message: MESSAGES[kind].success };
  }

  if (!deps.allow(clientKey)) {
    return {
      status: "error",
      message: RATE_LIMIT_MESSAGE,
      values: readValues(input, kind),
    };
  }

  const submission: ContactSubmission = {
    formType: kind,
    name: value.name,
    country: value.country,
    phone: value.phone,
    message: value.message,
    ...("category" in value && typeof value.category === "string"
      ? { category: value.category }
      : {}),
  };

  try {
    await deps.send(submission);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof ConfigError
          ? MESSAGES[kind].unavailable
          : MESSAGES[kind].failure,
      values: readValues(input, kind),
    };
  }

  return { status: "success", message: MESSAGES[kind].success };
}

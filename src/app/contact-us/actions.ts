"use server";

import { headers } from "next/headers";

import { ConfigError } from "@/lib/config";
import { sendContactEmail } from "@/lib/contact/email";
import { checkRateLimit } from "@/lib/contact/rate-limit";
import { validateQueryForm } from "@/lib/contact/validation";

export type QueryFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: {
    name: string;
    country: string;
    phone: string;
    category: string;
    message: string;
  };
};

export const INITIAL_QUERY_FORM_STATE: QueryFormState = { status: "idle" };

function readValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/**
 * Server action for the Contact Us Query form (spec #6). Reused verbatim on
 * the homepage: same validation, same recipients, same honeypot and rate
 * limiting. Nothing is persisted; the submission is emailed only.
 */
export async function submitQueryForm(
  _prevState: QueryFormState,
  formData: FormData,
): Promise<QueryFormState> {
  const values = {
    name: readValue(formData, "name"),
    country: readValue(formData, "country"),
    phone: readValue(formData, "phone"),
    category: readValue(formData, "category"),
    message: readValue(formData, "message"),
  };

  const validation = validateQueryForm({
    ...values,
    honeypot: readValue(formData, "company"),
  });

  if (!validation.ok) {
    return { status: "error", errors: validation.errors, values };
  }

  // Honeypot tripped: pretend success so bots do not learn anything.
  if (validation.value.honeypot !== "") {
    return {
      status: "success",
      message: "Thank you — your enquiry has been sent.",
    };
  }

  const forwardedFor = (await headers()).get("x-forwarded-for");
  const clientKey = forwardedFor?.split(",")[0]?.trim() || "unknown";

  if (!checkRateLimit(clientKey)) {
    return {
      status: "error",
      message: "Too many submissions. Please try again in a minute.",
      values,
    };
  }

  try {
    await sendContactEmail({
      formType: "query",
      name: validation.value.name,
      country: validation.value.country,
      phone: validation.value.phone,
      category: validation.value.category,
      message: validation.value.message,
    });
  } catch (error) {
    if (error instanceof ConfigError) {
      return {
        status: "error",
        message:
          "Online enquiries are temporarily unavailable. Please reach us on WhatsApp or by email.",
        values,
      };
    }
    return {
      status: "error",
      message:
        "We couldn't send your enquiry just now. Please try again or reach us on WhatsApp.",
      values,
    };
  }

  return {
    status: "success",
    message: "Thank you — your enquiry has been sent to Safeway Tyre.",
  };
}

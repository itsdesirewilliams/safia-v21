import { isCategorySlug, type CategorySlug } from "@/lib/catalogue/categories";

/**
 * Shared validation for the Contact Us forms (spec #6). The Query form (used
 * on Contact Us and on the homepage) requires a Category; the Feedback form
 * does not. Both pass through the same field rules here, so the two forms
 * behave identically for the fields they share.
 */

export type QueryFormValues = {
  name: string;
  country: string;
  phone: string;
  category: CategorySlug;
  message: string;
  /** Honeypot field — must stay empty. */
  honeypot: string;
};

export type FeedbackFormValues = {
  name: string;
  country: string;
  phone: string;
  message: string;
  /** Honeypot field — must stay empty. */
  honeypot: string;
};

export type QueryFormErrors = Record<string, string>;
export type FeedbackFormErrors = Record<string, string>;

export type QueryValidationResult =
  | { ok: true; value: QueryFormValues }
  | { ok: false; errors: QueryFormErrors };

export type FeedbackValidationResult =
  | { ok: true; value: FeedbackFormValues }
  | { ok: false; errors: FeedbackFormErrors };

const NAME_MIN = 2;
const NAME_MAX = 120;
const COUNTRY_MIN = 2;
const COUNTRY_MAX = 80;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 4000;

function readString(input: Record<string, unknown>, key: string): string {
  const value = input[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Country-aware-enough phone validation: accepts an optional international
 * prefix and common separators, and requires 7–15 digits (the ITU E.164 range,
 * which covers national and international numbers). This is the project's
 * shared approach for both forms; it deliberately rejects a naive
 * "exactly N digits" rule so international visitors are supported.
 */
export function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (trimmed.length === 0 || trimmed.length > 32) {
    return false;
  }
  if (!/^\+?[0-9()\s.-]+$/.test(trimmed)) {
    return false;
  }
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

type CommonValues = {
  name: string;
  country: string;
  phone: string;
  message: string;
  honeypot: string;
};

function validateCommon(
  input: Record<string, unknown>,
): { values: CommonValues; errors: Record<string, string> } {
  const name = readString(input, "name");
  const country = readString(input, "country");
  const phone = readString(input, "phone");
  const message = readString(input, "message");
  const honeypot = readString(input, "honeypot");

  const errors: Record<string, string> = {};

  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    errors.name = "Please enter your name.";
  }
  if (country.length < COUNTRY_MIN || country.length > COUNTRY_MAX) {
    errors.country = "Please enter your country.";
  }
  if (!isValidPhone(phone)) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
    errors.message = "Tell us what you need, including sizes if applicable.";
  }

  return { values: { name, country, phone, message, honeypot }, errors };
}

export function validateQueryForm(
  input: Record<string, unknown>,
): QueryValidationResult {
  const { values, errors } = validateCommon(input);
  const category = readString(input, "category");

  if (!isCategorySlug(category)) {
    errors.category = "Please choose a product category.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      ...values,
      category: category as CategorySlug,
    },
  };
}

export function validateFeedbackForm(
  input: Record<string, unknown>,
): FeedbackValidationResult {
  const { values, errors } = validateCommon(input);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: values };
}

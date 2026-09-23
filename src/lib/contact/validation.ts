import { isCategorySlug, type CategorySlug } from "@/lib/catalogue/categories";

/**
 * Shared validation for the Contact Us forms (spec #6). The Query form (used
 * on Contact Us and on the homepage) requires a Category; the Feedback form
 * does not. This is the single validation seam both forms pass through.
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

export type QueryFormErrors = Partial<Record<keyof QueryFormValues, string>>;

export type QueryValidationResult =
  | { ok: true; value: QueryFormValues }
  | { ok: false; errors: QueryFormErrors };

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
 * prefix and common separators, and requires 7–15 digits. Full
 * libphonenumber-grade validation is deferred to Ticket 6.
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

export function validateQueryForm(
  input: Record<string, unknown>,
): QueryValidationResult {
  const name = readString(input, "name");
  const country = readString(input, "country");
  const phone = readString(input, "phone");
  const category = readString(input, "category");
  const message = readString(input, "message");
  const honeypot = readString(input, "honeypot");

  const errors: QueryFormErrors = {};

  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    errors.name = "Please enter your name.";
  }
  if (country.length < COUNTRY_MIN || country.length > COUNTRY_MAX) {
    errors.country = "Please enter your country.";
  }
  if (!isValidPhone(phone)) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (!isCategorySlug(category)) {
    errors.category = "Please choose a product category.";
  }
  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
    errors.message = "Tell us what you need, including sizes if applicable.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      country,
      phone,
      category: category as CategorySlug,
      message,
      honeypot,
    },
  };
}

import type { CountryCode } from "libphonenumber-js";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import { isCategorySlug, type CategorySlug } from "@/lib/catalogue/categories";

import { isCountryCode } from "./countries";

/**
 * Shared validation for the Contact Us forms (spec #6). The Inquiry form (used
 * on Contact Us and on the homepage) requires at least one Category; the
 * Feedback form does not. Both pass through the same field rules here, so the
 * two forms behave identically for the fields they share.
 *
 * The visitor selects a country and types only the national number; this module
 * validates that number against the country's own rules and normalizes it to the
 * full international (E.164) number before it is delivered.
 */

export type QueryFormValues = {
  name: string;
  /** ISO country code selected from the list. */
  country: string;
  /** Full international phone number (dialing code + national number). */
  phone: string;
  categories: CategorySlug[];
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
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 4000;

function readString(input: Record<string, unknown>, key: string): string {
  const value = input[key];
  return typeof value === "string" ? value.trim() : "";
}

function readList(input: Record<string, unknown>, key: string): string[] {
  const value = input[key];
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }
  return typeof value === "string" ? [value] : [];
}

/**
 * Country-aware phone validation. The visitor types only the national number;
 * it is parsed against the selected country so the country's own length and
 * format rules apply (via libphonenumber-js). Returns the full international
 * number in E.164 form, or `null` when the number is not valid for that
 * country.
 */
export function normalizePhone(
  national: string,
  country: string,
): string | null {
  const trimmed = national.trim();
  if (trimmed.length === 0 || trimmed.length > 20) {
    return null;
  }
  if (!/^\+?[0-9()\s.-]+$/.test(trimmed)) {
    return null;
  }
  if (!isCountryCode(country)) {
    return null;
  }
  const parsed = parsePhoneNumberFromString(trimmed, country as CountryCode);
  if (!parsed || !parsed.isValid()) {
    return null;
  }
  return parsed.number;
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
  const nationalPhone = readString(input, "phone");
  const message = readString(input, "message");
  const honeypot = readString(input, "honeypot");

  const errors: Record<string, string> = {};

  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    errors.name = "Please enter your name.";
  }

  if (!isCountryCode(country)) {
    errors.country = "Please choose your country.";
  }

  const phone = normalizePhone(nationalPhone, country);
  if (!phone) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
    errors.message = "Tell us what you need, including sizes if applicable.";
  }

  return {
    values: { name, country, phone: phone ?? nationalPhone, message, honeypot },
    errors,
  };
}

export function validateQueryForm(
  input: Record<string, unknown>,
): QueryValidationResult {
  const { values, errors } = validateCommon(input);

  const categories = [
    ...new Set(
      readList(input, "category").filter(isCategorySlug),
    ),
  ] as CategorySlug[];

  if (categories.length === 0) {
    errors.categories = "Please choose at least one category.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { ...values, categories } };
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

import { countries } from "countries-list";

/**
 * Country + international dialing-code data for the Contact Us phone fields.
 *
 * Backed by the `countries-list` dataset so the dropdown is complete rather
 * than hand-maintained. The visitor selects a country; the dialing code is
 * derived from it and shown beside the phone field, never typed by hand.
 */

export type CountryOption = {
  /** ISO 3166-1 alpha-2 code, used as the form value. */
  code: string;
  name: string;
  /** International dialing code including the leading `+`. */
  dialCode: string;
};

export const COUNTRIES: readonly CountryOption[] = Object.entries(countries)
  .map(([code, data]) => ({
    code,
    name: data.name,
    dialCode: `+${data.phone[0] ?? ""}`,
  }))
  .filter((country) => country.dialCode !== "+")
  .sort((a, b) => a.name.localeCompare(b.name));

const BY_CODE = new Map<string, CountryOption>(
  COUNTRIES.map((country) => [country.code, country]),
);

/** Look up a country by its ISO code. */
export function getCountry(code: string): CountryOption | undefined {
  return BY_CODE.get(code);
}

/** Whether `value` is a known ISO country code. */
export function isCountryCode(value: string): boolean {
  return BY_CODE.has(value);
}

/** The dialing code for a country, or `null` when it is not known. */
export function dialCodeFor(code: string): string | null {
  return BY_CODE.get(code)?.dialCode ?? null;
}

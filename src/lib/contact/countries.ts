import { countries } from "countries-list";
import alpha2ToAlpha3 from "countries-list/minimal/countries.2to3.min.json";

/**
 * Country + international dialing-code data for the Contact Us phone fields.
 *
 * Backed by the `countries-list` dataset so the selector is complete rather
 * than hand-maintained. The visitor picks a country from a single joined
 * control; the dialing code is shown beside the selected ISO 3166-1 alpha-3
 * code (e.g. `IND (+91)`) and the national number is typed separately.
 */

export type CountryOption = {
  /** ISO 3166-1 alpha-2 code, used as the hidden form value. */
  code: string;
  /** ISO 3166-1 alpha-3 code, shown in the selector. */
  alpha3: string;
  /** Full country name, used in the delivered email. */
  name: string;
  /** International dialing code including the leading `+`. */
  dialCode: string;
  /** Selector label: alpha-3 code followed by the dialing code. */
  label: string;
};

/**
 * Territories in `countries-list` that no phone network serves (Antarctica and
 * a handful of uninhabited islands). They are dropped so every option the
 * selector offers can actually be validated by the phone-number rules.
 */
const UNVALIDATABLE_CODES = new Set([
  "AQ",
  "BV",
  "GS",
  "HM",
  "PN",
  "TF",
  "UM",
]);

export const COUNTRIES: readonly CountryOption[] = Object.entries(countries)
  .map(([code, data]) => {
    const dialCode = `+${data.phone[0] ?? ""}`;
    const alpha3 = alpha2ToAlpha3[code as keyof typeof alpha2ToAlpha3] ?? code;
    return {
      code,
      alpha3,
      name: data.name,
      dialCode,
      label: `${alpha3} (${dialCode})`,
    };
  })
  .filter(
    (country) =>
      country.dialCode !== "+" && !UNVALIDATABLE_CODES.has(country.code),
  )
  .sort((a, b) => a.alpha3.localeCompare(b.alpha3));

const BY_CODE = new Map<string, CountryOption>(
  COUNTRIES.map((country) => [country.code, country]),
);

const CODE_BY_NAME = new Map(
  Object.entries(countries).map(([code, data]) => [
    data.name.toLowerCase(),
    code,
  ]),
);

/** Look up a country by its ISO alpha-2 code. */
export function getCountry(code: string): CountryOption | undefined {
  return BY_CODE.get(code);
}

/** Whether `value` is a supported ISO alpha-2 country code. */
export function isCountryCode(value: string): boolean {
  return BY_CODE.has(value);
}

/**
 * The ISO 3166-1 alpha-2 code for a country name, or `null` when unrecognised.
 * This is the deterministic key used to render an SVG flag — never an emoji.
 */
export function countryCode(name: string): string | null {
  const code = CODE_BY_NAME.get(name.trim().toLowerCase());
  return code && code.length === 2 ? code.toUpperCase() : null;
}

/**
 * The regional-indicator flag emoji for a country name, or an empty string when
 * the name is not recognised. Retained for non-visual uses only; the public UI
 * renders a deterministic SVG flag (see `CountryFlag`) rather than this emoji.
 */
export function countryFlag(name: string): string {
  const code = countryCode(name);
  if (!code) {
    return "";
  }
  return String.fromCodePoint(
    ...[...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  );
}

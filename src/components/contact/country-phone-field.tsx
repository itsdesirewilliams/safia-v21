"use client";

import { useState } from "react";

import { COUNTRIES, dialCodeFor } from "@/lib/contact/countries";

import { FieldError, RequiredMark } from "./fields";

const PHONE_INPUT_CLASS =
  "w-full rounded-r-lg border border-ink-200 bg-white px-3.5 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15";

export type CountryPhoneFieldProps = {
  /** Prefix for the field ids, e.g. `query` → `query-country` / `query-phone`. */
  idPrefix: string;
  countryDefault?: string;
  phoneDefault?: string;
  countryError?: string;
  phoneError?: string;
  required?: boolean;
};

/**
 * Country dropdown + phone number fields (spec #6). The dialing code is shown
 * beside the number, derived from the selected country, so the visitor never
 * types it. Renders as two grid items for the surrounding form grid.
 */
export function CountryPhoneField({
  idPrefix,
  countryDefault,
  phoneDefault,
  countryError,
  phoneError,
  required,
}: CountryPhoneFieldProps) {
  const [country, setCountry] = useState(countryDefault ?? "");
  const dialCode = dialCodeFor(country);

  const countryId = `${idPrefix}-country`;
  const phoneId = `${idPrefix}-phone`;
  const countryErrorId = countryError ? `${countryId}-error` : undefined;
  const phoneErrorId = phoneError ? `${phoneId}-error` : undefined;

  return (
    <>
      <div>
        <label htmlFor={countryId} className="text-sm font-medium text-ink-950">
          Country {required && <RequiredMark />}
        </label>
        <select
          id={countryId}
          name="country"
          required={required}
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          autoComplete="country"
          aria-invalid={Boolean(countryError)}
          aria-describedby={countryErrorId}
          className="mt-2 w-full rounded-lg border border-ink-200 bg-white px-3.5 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15"
        >
          <option value="" disabled>
            Select a country
          </option>
          {COUNTRIES.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name} ({option.dialCode})
            </option>
          ))}
        </select>
        <FieldError id={countryErrorId} message={countryError} />
      </div>

      <div>
        <label htmlFor={phoneId} className="text-sm font-medium text-ink-950">
          Phone {required && <RequiredMark />}
        </label>
        <div className="mt-2 flex">
          <span
            aria-hidden="true"
            className="inline-flex shrink-0 items-center rounded-l-lg border border-r-0 border-ink-200 bg-ink-50 px-3.5 text-sm font-medium text-ink-600"
          >
            {dialCode ?? "+"}
          </span>
          <input
            id={phoneId}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            required={required}
            defaultValue={phoneDefault}
            placeholder="Phone number"
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneErrorId}
            className={PHONE_INPUT_CLASS}
          />
        </div>
        <FieldError id={phoneErrorId} message={phoneError} />
      </div>
    </>
  );
}

"use client";

import { useState } from "react";

import { COUNTRIES } from "@/lib/contact/countries";

import { FieldError, RequiredMark } from "./fields";

const SELECT_CLASS =
  "relative w-32 shrink-0 rounded-l-lg border border-r-0 border-ink-200 bg-ink-50 px-3 py-3 text-sm font-medium text-ink-900 outline-none transition focus:z-10 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15";

const INPUT_CLASS =
  "relative w-full min-w-0 rounded-r-lg border border-ink-200 bg-white px-3.5 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:z-10 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15";

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
 * Country selector + national number as one visually joined control. The left
 * segment lists every supported country as an ISO 3166-1 alpha-3 code with its
 * dialing code (`IND (+91)`) and submits its alpha-2 code; the right segment
 * accepts the national number in digits only. The full international number is
 * assembled server-side from the two.
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
  const [phone, setPhone] = useState((phoneDefault ?? "").replace(/\D/g, ""));

  const countryId = `${idPrefix}-country`;
  const phoneId = `${idPrefix}-phone`;
  const countryErrorId = countryError ? `${countryId}-error` : undefined;
  const phoneErrorId = phoneError ? `${phoneId}-error` : undefined;
  const describedBy =
    [countryErrorId, phoneErrorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={phoneId} className="text-sm font-medium text-ink-950">
        Phone {required && <RequiredMark />}
      </label>
      <div className="mt-2 flex w-full">
        <select
          id={countryId}
          name="country"
          required={required}
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          aria-label="Country calling code"
          aria-invalid={Boolean(countryError)}
          aria-describedby={describedBy}
          className={SELECT_CLASS}
        >
          <option value="" disabled>
            Country
          </option>
          {COUNTRIES.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          id={phoneId}
          name="phone"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="tel-national"
          required={required}
          value={phone}
          onChange={(event) =>
            setPhone(event.target.value.replace(/\D/g, ""))
          }
          placeholder="Phone number"
          aria-invalid={Boolean(countryError || phoneError)}
          aria-describedby={describedBy}
          className={INPUT_CLASS}
        />
      </div>
      <FieldError id={countryErrorId} message={countryError} />
      <FieldError id={phoneErrorId} message={phoneError} />
    </div>
  );
}

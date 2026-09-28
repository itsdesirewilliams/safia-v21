import { describe, expect, it } from "vitest";

import { countryFromHeaders } from "@/lib/contact/visitor-country";

function from(headers: Record<string, string>) {
  return (name: string) => headers[name];
}

describe("countryFromHeaders", () => {
  it("reads the Vercel country header", () => {
    expect(countryFromHeaders(from({ "x-vercel-ip-country": "IN" }))).toBe("IN");
    expect(countryFromHeaders(from({ "x-vercel-ip-country": "KE" }))).toBe("KE");
  });

  it("normalises case and whitespace", () => {
    expect(
      countryFromHeaders(from({ "x-vercel-ip-country": "  in  " })),
    ).toBe("IN");
  });

  it("falls through to Cloudflare and generic country headers", () => {
    expect(countryFromHeaders(from({ "cf-ipcountry": "GB" }))).toBe("GB");
    expect(countryFromHeaders(from({ "x-country-code": "DE" }))).toBe("DE");
  });

  it("prefers the first recognised hint", () => {
    expect(
      countryFromHeaders(
        from({ "x-vercel-ip-country": "KE", "cf-ipcountry": "IN" }),
      ),
    ).toBe("KE");
  });

  it("ignores unknown, unsupported or unvalidatable codes", () => {
    expect(countryFromHeaders(from({ "x-vercel-ip-country": "ZZ" }))).toBeNull();
    expect(countryFromHeaders(from({ "x-vercel-ip-country": "AQ" }))).toBeNull();
    expect(countryFromHeaders(from({ "x-vercel-ip-country": "" }))).toBeNull();
  });

  it("returns null when no hint is present", () => {
    expect(countryFromHeaders(from({}))).toBeNull();
  });
});

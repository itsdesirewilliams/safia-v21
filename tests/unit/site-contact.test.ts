import { describe, expect, it } from "vitest";

import { MARKETING_EMAILS, MARKETING_PHONES, SITE, telHref } from "@/lib/site";

describe("public marketing contact details", () => {
  it("lists both marketing emails in display order", () => {
    expect(MARKETING_EMAILS).toEqual([
      "marketing@safewaytyre.com",
      "marketing01@safewaytyre.com",
    ]);
  });

  it("lists both marketing phone numbers in display order", () => {
    expect(MARKETING_PHONES).toEqual([
      "+91 90416 62182",
      "+91 80543 62182",
    ]);
  });

  it("keeps the Director address and the inquiry-form recipient unchanged", () => {
    expect(SITE.emails.director).toBe("Director@safewaytyre.com");
    expect(SITE.emails.marketing).toBe("marketing01@safewaytyre.com");
    expect(SITE.whatsappUrl).toBe("https://wa.me/+919915762182");
  });

  it("builds tel: links without spaces", () => {
    expect(telHref("+91 90416 62182")).toBe("tel:+919041662182");
    expect(telHref(SITE.phone.tertiary)).toBe("tel:+918054362182");
  });
});

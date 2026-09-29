export const SITE = {
  name: "Safeway Tyre",
  legalName: "DEE RON Automotives LLP",
  tagline: "Exporting Durable Tyres Worldwide",
  emails: {
    /**
     * The Director address is displayed with a capital D by Safeway's
     * instruction. Email is case-insensitive for delivery; keep this exact
     * casing wherever the address is shown.
     */
    director: "Director@safewaytyre.com",
    /** Existing marketing address; also an inquiry-form recipient. */
    marketing: "marketing01@safewaytyre.com",
    /** Additional marketing address shown as a public contact. */
    marketingGeneral: "marketing@safewaytyre.com",
  },
  phone: {
    /** Primary / WhatsApp business line (unchanged). */
    primary: "+91 99157 62182",
    /** Marketing contact lines. */
    secondary: "+91 90416 62182",
    tertiary: "+91 80543 62182",
  },
  whatsappUrl: "https://wa.me/+919915762182",
  /** Approved Safeway Tyre Instagram profile. */
  instagramUrl: "https://www.instagram.com/safewaytyre/",
  /** The two published Safeway Tyre locations. */
  addresses: [
    {
      label: "Corporate Office",
      lines: [
        "SCO No. 21, SEC 17,",
        "Omaxe Residency Pakhowal Road,",
        "Ludhiana, 142022, India",
      ],
    },
    {
      label: "Factory",
      lines: ["115 Dhandari Kalan,", "Ludhiana, India"],
    },
  ],
  openingHours: {
    days: "Monday – Saturday",
    hours: "9:00 AM – 5:00 PM",
    closed: "Sunday",
  },
} as const;

/**
 * The marketing contact details shown across the public site (footer, homepage
 * and Contact Us), in display order. Single source of truth so the same
 * addresses and numbers are formatted identically everywhere.
 */
export const MARKETING_EMAILS: readonly string[] = [
  SITE.emails.marketingGeneral,
  SITE.emails.marketing,
];

export const MARKETING_PHONES: readonly string[] = [
  SITE.phone.secondary,
  SITE.phone.tertiary,
];

/** Format a phone number for a `tel:` link (strip spaces). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

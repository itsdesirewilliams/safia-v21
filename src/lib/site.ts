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
  /** Canonical WhatsApp deep link (E.164 digits, no leading `+`). */
  whatsappUrl: "https://wa.me/919915762182",
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

/**
 * The full public contact email list, in display order: the Director address
 * first, then both marketing addresses. Used wherever the site presents its
 * contact addresses (footer, homepage and Contact Us). The Director address is
 * also shown on its own (for example the footer CTA); including it in this list
 * too is intentional, not redundant.
 */
export const PUBLIC_CONTACT_EMAILS: readonly string[] = [
  SITE.emails.director,
  ...MARKETING_EMAILS,
];

export const MARKETING_PHONES: readonly string[] = [
  SITE.phone.secondary,
  SITE.phone.tertiary,
];

/** Format a phone number for a `tel:` link (strip spaces). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

/**
 * Safeway Tyre's official social profiles, as developer-owned fixed content.
 *
 * These used to be read from `NEXT_PUBLIC_SOCIAL_*` env vars, which are inlined
 * at build time and were absent in production — leaving the footer icons
 * decorative. Fixed company content belongs in code (CONTEXT.md), so the
 * canonical URLs live here and always render working links.
 */
export type OfficialSocialLink = {
  name: "Instagram" | "Facebook" | "LinkedIn" | "X" | "Pinterest";
  url: string;
};

export const SOCIAL_LINKS: readonly OfficialSocialLink[] = [
  { name: "Instagram", url: "https://www.instagram.com/safewaytyre/" },
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61578894803518",
  },
  { name: "LinkedIn", url: "https://www.linkedin.com/company/safeway-tyre/" },
  { name: "X", url: "https://x.com/safewaytyre" },
  { name: "Pinterest", url: "https://in.pinterest.com/safewaytyreindia/" },
];

/** The corporate office, as a single-line address for maps and forms. */
export const CORPORATE_OFFICE_ADDRESS = SITE.addresses[0].lines.join(" ");

/**
 * A key-free Google Maps embed for the corporate office. The public
 * `output=embed` endpoint needs no client-side API key, so the map always
 * renders without a paid key or a build-time secret.
 */
export const CORPORATE_OFFICE_MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  CORPORATE_OFFICE_ADDRESS,
)}&z=15&output=embed`;

/** A link that opens the corporate office in Google Maps. */
export const CORPORATE_OFFICE_MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  CORPORATE_OFFICE_ADDRESS,
)}`;

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
    marketing: "marketing01@safewaytyre.com",
  },
  phone: {
    primary: "+91 99157 62182",
    secondary: "+91 90416 62182",
  },
  whatsappUrl: "https://wa.me/+919915762182",
  openingHours: {
    days: "Monday – Saturday",
    hours: "9:00 AM – 5:00 PM",
    closed: "Sunday",
  },
} as const;

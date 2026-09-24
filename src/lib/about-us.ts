import { ROUTES, type NavLink } from "@/lib/routes";

/**
 * Developer-owned About Us content (spec #4 / Ticket #20).
 *
 * About Us is a static page with three fixed sections: the company bio, the
 * Team section, and the Business Profile slider. Everything here ships via
 * code — there is no admin surface and no database content model. The bio uses
 * only already-approved facts about the company; team-member profiles have not
 * been supplied, so none are invented and the Team section renders a labelled
 * placeholder until they are added below.
 */

export const ABOUT_BIO = {
  eyebrow: "About Us",
  title: "About Safeway Tyre",
  lead: "Safeway Tyre is the tyre brand of DEE RON Automotives LLP, a family-run manufacturer headquartered in Punjab, India.",
  paragraphs: [
    "We design and make tyres for motorcycle, three-wheeler, truck & bus, agriculture, off-the-road (OTR) and forklift applications — the ranges that keep people and goods moving on highways, on farms, in mines and on the factory floor.",
    "From Punjab we export durable tyres worldwide. Every pattern in the range is documented in the catalogue with its sizes and specifications, and covered by the Safeway Tyre warranty.",
  ],
  primary: {
    label: "Explore the Catalogue",
    href: ROUTES.catalogue,
  } satisfies NavLink,
  secondary: { label: "Contact Us", href: ROUTES.contactUs } satisfies NavLink,
} as const;

export type TeamMember = {
  name: string;
  role: string;
  bio?: string;
  /** Optional image URL or path; when absent the card shows the member's initials. */
  image?: string | null;
};

export const ABOUT_TEAM = {
  eyebrow: "The team",
  title: "The people behind Safeway Tyre",
  description:
    "Safeway Tyre is family-run. The people who lead the company are introduced here.",
  empty: {
    label: "Team profiles not supplied",
    detail:
      "No team-member profiles have been provided. Add a name, role and optional image to ABOUT_TEAM_MEMBERS in src/lib/about-us.ts to populate this section — no database or admin step is required.",
  },
} as const;

/**
 * Team-member profiles. Empty by design: the master document carries no
 * team-member data, so none is invented. Add entries here to populate the
 * Team section.
 */
export const ABOUT_TEAM_MEMBERS: readonly TeamMember[] = [];

export const ABOUT_BUSINESS_PROFILE = {
  eyebrow: "Business profile",
  title: "Explore Business Profile",
  description:
    "Page through Safeway Tyre's business-profile documents. On a phone the slider switches to the portrait edition; on larger screens, the landscape edition.",
} as const;

/**
 * Developer-owned About Us content (spec #4 / Ticket #20).
 *
 * About Us is a static page with three fixed sections: the company bio, the
 * Team section, and the Business Profile slider. Everything here ships via
 * code — there is no admin surface and no database content model. The bio uses
 * only already-approved facts about the company. The Team profiles below are
 * temporary placeholders until Safeway supplies real portraits and quotations.
 */

export const ABOUT_BIO = {
  title: "About Safeway Tyre",
  lead: "Safeway Tyre is the tyre brand of DEE RON Automotives LLP, a family-run manufacturer headquartered in Punjab, India.",
  paragraphs: [
    "We design and make tyres for motorcycle, three-wheeler, truck & bus, agriculture, off-the-road (OTR) and forklift applications — the ranges that keep people and goods moving on highways, on farms, in mines and on the factory floor.",
    "From Punjab we export durable tyres worldwide. Every pattern in the range is documented in the catalogue with its sizes and specifications, and covered by the Safeway Tyre warranty.",
  ],
} as const;

export type TeamMember = {
  name: string;
  role: string;
  bio?: string;
  /** Optional image URL or path; when absent the card shows a silhouette. */
  image?: string | null;
};

export const ABOUT_TEAM = {
  title: "Meet the Team",
  description: "A few members of the Safeway Tyre team.",
  /** Makes the placeholder nature of the current profiles explicit. */
  temporaryNote:
    "Team portraits and quotations are temporary placeholders pending supplied content.",
  empty: {
    label: "Team Profiles Coming Soon",
    detail: "We are preparing team-member profiles. Please check back soon.",
  },
} as const;

/**
 * Temporary team profiles. Portraits and quotations are placeholders until
 * Safeway supplies the real content, and are marked as such in the Team section.
 */
export const ABOUT_TEAM_MEMBERS: readonly TeamMember[] = [
  {
    name: "Sandeep Chaudhry",
    role: "Director, Safeway Tyre",
    bio: "We lead Safeway Tyre with a focus on consistent quality across every range we make. Our work is built around long-term relationships with the partners we serve. We are always looking at better ways to manufacture, test and deliver.",
  },
  {
    name: "Desiree Williams",
    role: "Lead Marketing Executive, Safeway Tyre",
    bio: "Telling the Safeway Tyre story is about showing the care behind every tyre. We work closely with our international partners to understand what each market needs. Our aim is to make sure every customer feels supported from first contact onward.",
  },
  {
    name: "Shubhika Batra",
    role: "Manager, Safeway Tyre",
    bio: "Coordinating across our teams keeps every order moving on time and to specification. We pay close attention to the details partners ask for, from sizes to documentation. Our priority is to make working with Safeway Tyre straightforward and dependable.",
  },
];

export const ABOUT_BUSINESS_PROFILE = {
  title: "Explore Business Profile",
  description: "Page through Safeway Tyre's business-profile documents.",
} as const;

import { ROUTES, type NavLink } from "@/lib/routes";

/**
 * Developer-owned Quality First page copy (spec #3 / Ticket 5).
 *
 * The page structure is fixed (hero → story rail → testing explanation →
 * machine images → CTA) and this text ships with the code; it has no admin
 * surface. It deliberately avoids specific testing standards, machine names,
 * certifications, laboratory capabilities or production figures, none of which
 * have been supplied. The explanatory section carries a labelled note saying so
 * rather than inventing them.
 */

export const QUALITY_FIRST_HERO = {
  title: "Quality Is a Process, Not a Promise.",
  description:
    "Safeway Tyre's Quality First page documents the testing and quality-control process behind every pattern we make — the footage from the testing floor, an explanation of the process, and the machines that carry it out.",
} as const;

export const QUALITY_FIRST_STORY_SECTION = {
  title: "Stories from the Testing Floor",
  description:
    "Short videos from Safeway Tyre's testing process. Select a story to watch it.",
} as const;

export const QUALITY_FIRST_MACHINE_SECTION = {
  title: "The Machines Behind the Testing",
  description:
    "Images of the equipment used across Safeway Tyre's testing and quality-control process.",
} as const;

export type ExplanationBlock = {
  heading: string;
  body: readonly string[];
};

export const QUALITY_FIRST_EXPLANATION = {
  title: "How Quality Is Built In",
  intro:
    "Quality First is how Safeway Tyre describes the testing and quality-control discipline that runs through its ranges. The sections above and below collect the evidence of that process; the notes here explain what you are looking at.",
  blocks: [
    {
      heading: "A Discipline That Runs Through Production",
      body: [
        "Quality control is not a final step at Safeway Tyre; it runs alongside the work. Patterns are developed and checked against the standard they were designed to, and the process is documented as it happens.",
        "This page brings that work together in one place, so customers and partners can see how the tyres they order are handled before they leave the factory.",
      ],
    },
    {
      heading: "See the Testing Floor",
      body: [
        "The story rail above collects short videos from Safeway Tyre's testing process. Select any card to watch it in full.",
        "The machine images below show the equipment involved. Both sets of media are added directly, so the record grows as more footage and photography is supplied.",
      ],
    },
  ] satisfies readonly ExplanationBlock[],
  /** Labelled stand-in for the detailed process copy that has not been supplied. */
  note: {
    label: "More Detail Coming Soon",
    detail:
      "Detailed information about our testing standards, equipment and processes will be published here soon.",
  },
  links: [
    { label: "Truck & Bus tyres", href: ROUTES.category("truck-bus") },
    { label: "Explore the Catalogue", href: ROUTES.catalogue },
    { label: "About Us", href: ROUTES.aboutUs },
    { label: "Warranty", href: ROUTES.warranty },
    { label: "Contact Us", href: ROUTES.contactUs },
  ] satisfies readonly NavLink[],
} as const;

export const QUALITY_FIRST_CTA = {
  title: "Explore the Range",
  description:
    "Browse Safeway Tyre's ranges or send an enquiry for a specific pattern or size.",
  primary: { label: "Request a Quotation", href: ROUTES.contactUs },
  secondary: { label: "Explore the Catalogue", href: ROUTES.catalogue },
} as const;

export const QUALITY_FIRST_EMPTY_STATES = {
  stories: {
    label: "Testing Videos Coming Soon",
    detail: "Footage from Safeway Tyre's testing floor will appear here soon.",
  },
  machines: {
    label: "Machine Images Coming Soon",
    detail: "Photographs of the equipment behind our testing will appear here soon.",
  },
} as const;

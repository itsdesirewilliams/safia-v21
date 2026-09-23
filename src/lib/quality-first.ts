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
  eyebrow: "Quality First",
  title: "Quality is a process, not a promise.",
  description:
    "Safeway Tyre's Quality First page documents the testing and quality-control process behind every pattern we make — the footage from the testing floor, an explanation of the process, and the machines that carry it out.",
} as const;

export const QUALITY_FIRST_STORY_SECTION = {
  eyebrow: "Testing in motion",
  title: "Stories from the testing floor",
  description:
    "Short videos from Safeway Tyre's testing process. Select a story to watch it.",
} as const;

export const QUALITY_FIRST_MACHINE_SECTION = {
  eyebrow: "On the floor",
  title: "The machines behind the testing",
  description:
    "Images of the equipment used across Safeway Tyre's testing and quality-control process.",
} as const;

export type ExplanationBlock = {
  heading: string;
  body: readonly string[];
};

export const QUALITY_FIRST_EXPLANATION = {
  eyebrow: "The process",
  title: "How quality is built in",
  intro:
    "Quality First is how Safeway Tyre describes the testing and quality-control discipline that runs through its ranges. The sections above and below collect the evidence of that process; the notes here explain what you are looking at.",
  blocks: [
    {
      heading: "A discipline that runs through production",
      body: [
        "Quality control is not a final step at Safeway Tyre; it runs alongside the work. Patterns are developed and checked against the standard they were designed to, and the process is documented as it happens.",
        "This page brings that work together in one place, so customers and partners can see how the tyres they order are handled before they leave the factory.",
      ],
    },
    {
      heading: "See the testing floor",
      body: [
        "The story rail above collects short videos from Safeway Tyre's testing process. Select any card to watch it in full.",
        "The machine images below show the equipment involved. Both sets of media are added directly, so the record grows as more footage and photography is supplied.",
      ],
    },
  ] satisfies readonly ExplanationBlock[],
  /** Labelled stand-in for the detailed process copy that has not been supplied. */
  note: {
    label: "Detailed process copy pending",
    detail:
      "Specific testing standards, machine names, laboratory capabilities and certifications have not been supplied. They are deliberately not shown here rather than invented. Add the approved copy to this section when it is available.",
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
  eyebrow: "Next steps",
  title: "Explore the range",
  description:
    "Browse Safeway Tyre's ranges or send an enquiry for a specific pattern or size.",
  primary: { label: "Request a Quotation", href: ROUTES.contactUs },
  secondary: { label: "Explore the Catalogue", href: ROUTES.catalogue },
} as const;

export const QUALITY_FIRST_EMPTY_STATES = {
  stories: {
    label: "Testing videos not supplied",
    detail:
      "No videos have been added to the testing-videos/stories folder yet. Add .mp4 or .webm files there to populate this rail — no code change is required.",
  },
  machines: {
    label: "Testing machine images not supplied",
    detail:
      "No images have been added to the machine-images bucket yet. Add image files there to populate this gallery — no code change is required.",
  },
} as const;

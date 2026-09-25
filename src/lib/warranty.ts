import { CATEGORIES } from "@/lib/catalogue/categories";
import { ROUTES, type NavLink } from "@/lib/routes";
import { SITE } from "@/lib/site";

/**
 * Developer-owned Warranty page content (spec #5 / Ticket #17).
 *
 * The Warranty policy text is reproduced from Safeway Tyre's existing,
 * authorised Warranty Policy page — the one explicit exception to the rule
 * that the old site is never a content source. Terminology, coverage periods,
 * percentages and legal wording are preserved; only the presentation is
 * redesigned. Do not invent or reword the terms.
 */

export type WarrantyFact = {
  value: string;
  label: string;
};

export type PolicyDefinition = {
  term: string;
  definition: string;
};

export type PolicyTermRow = {
  label: string;
  value: string;
};

export type PolicyBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "definitions"; items: readonly PolicyDefinition[] }
  | { kind: "list"; items: readonly string[] }
  | { kind: "terms"; rows: readonly PolicyTermRow[] };

export type PolicySubsection = {
  number: string;
  title: string;
  blocks: readonly PolicyBlock[];
};

export type PolicySection = {
  id: string;
  number: string;
  title: string;
  blocks: readonly PolicyBlock[];
  subsections?: readonly PolicySubsection[];
};

export const WARRANTY_HERO = {
  title: "Warranty Policy",
  description:
    "Safeway Tyres warrants each Tyre against manufacturing defects in materials and workmanship, and provides a pro-rata wear credit. The full terms, exclusions and claim procedure are set out below.",
  facts: [
    {
      value: "2 years",
      label: "Manufacturing defects, from date of manufacture",
    },
    { value: "Up to 85%", label: "Pro-rata credit on usable tread depth" },
    { value: "21 days", label: "To present a claim at an Authorized Outlet" },
  ] satisfies readonly WarrantyFact[],
} as const;

export const WARRANTY_SECTIONS: readonly PolicySection[] = [
  {
    id: "definitions",
    number: "1",
    title: "Definitions",
    blocks: [
      {
        kind: "definitions",
        items: [
          {
            term: "Company",
            definition:
              "Refers to Safeway Tyres, a family-run tyre manufacturer headquartered in Punjab, India.",
          },
          {
            term: "Customer",
            definition: "Refers to the original purchaser of the tyre.",
          },
          {
            term: "Tyre",
            definition:
              "Refers to any rubber tyre or tube manufactured and sold by Safeway Tyres.",
          },
          {
            term: "Authorized Outlet",
            definition:
              "Means any dealer, distributor, or service center officially appointed by Safeway Tyres.",
          },
        ],
      },
    ],
  },
  {
    id: "applicability",
    number: "2",
    title: "Applicability",
    blocks: [
      {
        kind: "paragraph",
        text: "Safeway Tyres warrants each Tyre to be free from manufacturing defects in materials and workmanship under normal use and service for a period of two (2) years from date of manufacture or until the Tyre reaches the industry standard tread wear indicator (TWI), whichever occurs first.",
      },
    ],
  },
  {
    id: "coverage",
    number: "3",
    title: "Warranty Coverage",
    blocks: [],
    subsections: [
      {
        number: "3.1",
        title: "Manufacturing Defects Warranty",
        blocks: [
          {
            kind: "paragraph",
            text: "Safeway Tyres warrants each Tyre to be free from manufacturing defects in materials and workmanship under normal use and service for a period of two (2) years from date of manufacture or until the Tyre reaches the industry standard tread wear indicator (TWI), whichever occurs first.",
          },
        ],
      },
      {
        number: "3.2",
        title: "Pro-Rata Wear Warranty",
        blocks: [
          {
            kind: "paragraph",
            text: "Subject to the terms below, Safeway Tyres will provide a pro-rata replacement credit up to eighty-five percent (85%) of the usable tread depth for worn Tyres, measured from TWI back to the original mould tread depth, for a period of two (2) years from date of manufacture.",
          },
        ],
      },
    ],
  },
  {
    id: "terms-by-category",
    number: "4",
    title: "Warranty Terms by Category",
    blocks: [],
    subsections: [
      {
        number: "4.1",
        title: "Agricultural Tyres",
        blocks: [
          {
            kind: "terms",
            rows: [
              {
                label: "Unconditional Warranty",
                value:
                  "Two (2) years from date of manufacture or until TWI reached.",
              },
              {
                label: "Pro-Rata Credit",
                value: "Up to 85% of usable tread depth.",
              },
            ],
          },
        ],
      },
      {
        number: "4.2",
        title: "Nylon Truck Tyres (Bias & Radial)",
        blocks: [
          {
            kind: "terms",
            rows: [
              {
                label: "Unconditional Warranty",
                value:
                  "Two (2) years from date of manufacture or until TWI reached.",
              },
              {
                label: "Pro-Rata Credit",
                value: "Up to 85% of usable tread depth.",
              },
            ],
          },
        ],
      },
      {
        number: "4.3",
        title: "Off-The-Road (OTR) Tyres",
        blocks: [
          {
            kind: "terms",
            rows: [
              {
                label: "Unconditional Warranty",
                value:
                  "Two (2) years from date of manufacture or until TWI reached.",
              },
              {
                label: "Pro-Rata Credit",
                value: "Up to 85% of usable tread depth.",
              },
            ],
          },
        ],
      },
      {
        number: "4.4",
        title: "Industrial Tyres (Solid & Pneumatic)",
        blocks: [
          {
            kind: "terms",
            rows: [
              {
                label: "Unconditional Warranty",
                value:
                  "Two (2) years from date of manufacture or until TWI reached (pneumatic only).",
              },
              {
                label: "Pro-Rata Credit",
                value: "Up to 85% of usable tread depth.",
              },
            ],
          },
        ],
      },
      {
        number: "4.5",
        title: "Motorcycle Tyres & Tubes",
        blocks: [
          {
            kind: "terms",
            rows: [
              {
                label: "Unconditional Warranty",
                value:
                  "Two (2) years from date of manufacture or until 0.8 mm tread depth reached.",
              },
            ],
          },
          {
            kind: "paragraph",
            text: "Tubes: Warranty applies only to material and workmanship defects; no wear warranty.",
          },
          {
            kind: "terms",
            rows: [
              {
                label: "Pro-Rata Credit (Tyres)",
                value: "Up to 85% of usable tread depth.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "exclusions",
    number: "5",
    title: "Exclusions",
    blocks: [
      { kind: "paragraph", text: "This Warranty does not cover:" },
      {
        kind: "list",
        items: [
          "Damage due to road hazards (punctures, cuts, impacts).",
          "Misuse or improper maintenance (overloading, under-inflation, improper mounting).",
          "Tyres or tubes repaired, altered, or modified by unauthorized persons.",
          "Damage from racing, speedway, or off-specification use beyond rated capacity.",
          "Chemical or abrasive contact causing premature wear.",
          "Normal cosmetic imperfections that do not affect performance or safety.",
        ],
      },
    ],
  },
  {
    id: "claim-procedure",
    number: "6",
    title: "Claim Procedure",
    blocks: [],
    subsections: [
      {
        number: "6.1",
        title: "Claim Submission",
        blocks: [
          {
            kind: "list",
            items: [
              "Customer must present the Tyre or Tube at an Authorized Outlet within twenty-one (21) days of discovering a defect or abnormal wear.",
              "Customer must provide the original proof of purchase (invoice or digital receipt).",
            ],
          },
        ],
      },
      {
        number: "6.2",
        title: "Inspection & Replacement",
        blocks: [
          {
            kind: "list",
            items: [
              "Authorized Outlet will inspect the Tyre or Tube.",
              "If a manufacturing defect or qualifying wear is confirmed, Safeway Tyres will, at its discretion, replace the Tyre or credit the Customer on a pro-rata basis.",
              "Customer is responsible for mounting, balancing, and transportation costs.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "limitation-of-liability",
    number: "7",
    title: "Limitation of Liability",
    blocks: [
      {
        kind: "paragraph",
        text: "Safeway Tyres\u2019 sole liability under this Warranty is limited to replacement or pro-rata credit as described herein. Safeway Tyres shall not be liable for any incidental or consequential damages.",
      },
    ],
  },
  {
    id: "governing-law",
    number: "8",
    title: "Governing Law",
    blocks: [
      {
        kind: "paragraph",
        text: "This Warranty Policy shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the courts in Punjab, India.",
      },
    ],
  },
];

export const WARRANTY_CONTACT = {
  title: "How To Get In Touch",
  intro: "For questions or to initiate a claim, please contact:",
  name: "Safeway Tyres Customer Care",
  email: SITE.emails.marketing,
  phone: SITE.phone.primary,
  website: "www.safewaytyre.com",
} as const;

export const WARRANTY_RELATED = {
  title: "Where to Go Next",
  productsLabel: "Products",
  products: CATEGORIES.map((category) => ({
    label: category.displayName,
    href: ROUTES.category(category.slug),
  })) satisfies readonly NavLink[],
  links: [
    { label: "Quality First", href: ROUTES.qualityFirst },
    { label: "Contact Us", href: ROUTES.contactUs },
    { label: "Catalogue", href: ROUTES.catalogue },
  ] satisfies readonly NavLink[],
} as const;

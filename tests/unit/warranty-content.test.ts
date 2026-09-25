import { describe, expect, it } from "vitest";

import { CATEGORIES } from "@/lib/catalogue/categories";
import { ROUTES } from "@/lib/routes";
import { SITE } from "@/lib/site";
import {
  WARRANTY_CONTACT,
  WARRANTY_HERO,
  WARRANTY_RELATED,
  WARRANTY_SECTIONS,
  type PolicyBlock,
  type PolicySection,
} from "@/lib/warranty";

function blockText(block: PolicyBlock): string[] {
  switch (block.kind) {
    case "paragraph":
      return [block.text];
    case "definitions":
      return block.items.flatMap((item) => [item.term, item.definition]);
    case "list":
      return [...block.items];
    case "terms":
      return block.rows.flatMap((row) => [row.label, row.value]);
  }
}

function sectionText(section: PolicySection): string {
  const parts: string[] = [section.title];
  for (const block of section.blocks) {
    parts.push(...blockText(block));
  }
  for (const subsection of section.subsections ?? []) {
    parts.push(subsection.title);
    for (const block of subsection.blocks) {
      parts.push(...blockText(block));
    }
  }
  return parts.join("\n");
}

const ALL_TEXT = WARRANTY_SECTIONS.map(sectionText).join("\n\n");

function listItems(blocks: readonly PolicyBlock[] | undefined): readonly string[] {
  const block = blocks?.find((candidate) => candidate.kind === "list");
  return block?.kind === "list" ? block.items : [];
}

describe("warranty content contract", () => {
  it("has the hero heading and the eight policy sections in order", () => {
    expect(WARRANTY_HERO.title).toBe("Warranty Policy");

    expect(WARRANTY_SECTIONS.map((section) => section.number)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
    ]);
    expect(WARRANTY_SECTIONS.map((section) => section.title)).toEqual([
      "Definitions",
      "Applicability",
      "Warranty Coverage",
      "Warranty Terms by Category",
      "Exclusions",
      "Claim Procedure",
      "Limitation of Liability",
      "Governing Law",
    ]);
  });

  it("exposes a unique anchor id for every section", () => {
    const ids = WARRANTY_SECTIONS.map((section) => section.id);
    expect(ids.every((id) => id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("preserves the legal meaning and terminology", () => {
    expect(ALL_TEXT).toContain("two (2) years from date of manufacture");
    expect(ALL_TEXT).toContain("tread wear indicator (TWI)");
    expect(ALL_TEXT).toContain("eighty-five percent (85%)");
    expect(ALL_TEXT).toContain("twenty-one (21) days");
    expect(ALL_TEXT).toContain("Republic of India");
    expect(ALL_TEXT).toContain("Punjab, India");
    expect(ALL_TEXT).toContain("incidental or consequential damages");
    expect(ALL_TEXT).toContain(
      "Safeway Tyres will, at its discretion, replace the Tyre or credit the Customer on a pro-rata basis",
    );
  });

  it("lists the warranty terms for each of the five categories", () => {
    const terms = WARRANTY_SECTIONS.find(
      (section) => section.title === "Warranty Terms by Category",
    );
    expect(terms?.subsections?.map((subsection) => subsection.title)).toEqual([
      "Agricultural Tyres",
      "Nylon Truck Tyres (Bias & Radial)",
      "Off-The-Road (OTR) Tyres",
      "Industrial Tyres (Solid & Pneumatic)",
      "Motorcycle Tyres & Tubes",
    ]);
    expect(terms?.subsections).toHaveLength(5);
    expect(ALL_TEXT).toContain("0.8 mm tread depth reached");
    expect(ALL_TEXT).toContain("no wear warranty");
  });

  it("keeps the exclusions and claim-procedure lists intact", () => {
    const exclusions = WARRANTY_SECTIONS.find(
      (section) => section.title === "Exclusions",
    );
    expect(listItems(exclusions?.blocks)).toHaveLength(6);

    const claims = WARRANTY_SECTIONS.find(
      (section) => section.title === "Claim Procedure",
    );
    const submission = claims?.subsections?.[0];
    const inspection = claims?.subsections?.[1];
    expect(submission?.title).toBe("Claim Submission");
    expect(inspection?.title).toBe("Inspection & Replacement");
    expect(listItems(submission?.blocks)).toHaveLength(2);
    expect(listItems(inspection?.blocks)).toHaveLength(3);
    expect(ALL_TEXT).toContain(
      "Customer is responsible for mounting, balancing, and transportation costs.",
    );
  });

  it("points customer care at the approved contact details", () => {
    expect(WARRANTY_CONTACT.email).toBe(SITE.emails.marketing);
    expect(WARRANTY_CONTACT.phone).toBe(SITE.phone.primary);
    expect(WARRANTY_CONTACT.name).toContain("Safeway");
  });

  it("links to Products, Quality First, Contact Us and Catalogue", () => {
    expect(WARRANTY_RELATED.products.map((link) => link.href)).toEqual(
      CATEGORIES.map((category) => ROUTES.category(category.slug)),
    );

    const hrefs = WARRANTY_RELATED.links.map((link) => link.href);
    expect(hrefs).toContain(ROUTES.qualityFirst);
    expect(hrefs).toContain(ROUTES.contactUs);
    expect(hrefs).toContain(ROUTES.catalogue);
  });
});

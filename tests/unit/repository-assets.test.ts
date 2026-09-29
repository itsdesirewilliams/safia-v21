import { describe, expect, it } from "vitest";

import {
  countRepositoryAssets,
  readRepositoryAssets,
} from "@/lib/media/repository-assets";

/**
 * Validates the repository migration: the canonical `public/assets` groups must
 * exist and resolve to the served URLs.
 */
describe("repository assets", () => {
  const groups = readRepositoryAssets();
  const byId = new Map(groups.map((group) => [group.id, group]));

  it("reports every canonical group", () => {
    for (const id of [
      "business-profile-landscape",
      "business-profile-portrait",
      "business-profile-pdf",
      "catalogue-portrait",
      "catalogue-pdf",
      "team",
      "certifications-logos",
      "certifications-pdfs",
      "testing-videos",
      "testing-images",
    ]) {
      expect(byId.has(id)).toBe(true);
    }
  });

  it("finds the migrated business-profile and catalogue files", () => {
    expect(
      byId.get("business-profile-landscape")?.files.length,
    ).toBeGreaterThan(0);
    expect(
      byId.get("business-profile-portrait")?.files.length,
    ).toBeGreaterThan(0);
    expect(byId.get("catalogue-portrait")?.files.length).toBeGreaterThan(0);

    expect(
      byId.get("business-profile-pdf")?.files.map((file) => file.name),
    ).toContain("Safeway-Tyre-Business-Profile.pdf");
    expect(byId.get("catalogue-pdf")?.files.map((file) => file.name)).toContain(
      "Safeway-Tyre-Catalogue.pdf",
    );
  });

  it("resolves every file to a canonical public URL with a size", () => {
    for (const group of groups) {
      for (const file of group.files) {
        expect(file.url.startsWith("/assets/")).toBe(true);
        expect(file.sizeBytes).toBeGreaterThan(0);
        expect(file.mimeType.length).toBeGreaterThan(0);
      }
    }
  });

  it("counts the repository files", () => {
    expect(countRepositoryAssets()).toBeGreaterThan(50);
  });
});

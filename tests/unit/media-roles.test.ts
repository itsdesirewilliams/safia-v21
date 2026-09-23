import { describe, expect, it } from "vitest";

import {
  canDeleteMedia,
  canManageMedia,
  isRole,
  parseRole,
} from "@/lib/auth/roles";

describe("role parsing", () => {
  it("recognises the two canonical roles", () => {
    expect(isRole("admin")).toBe(true);
    expect(isRole("editor")).toBe(true);
    expect(isRole("owner")).toBe(false);
    expect(isRole(null)).toBe(false);
  });

  it("parses unknown role values to null", () => {
    expect(parseRole("admin")).toBe("admin");
    expect(parseRole("editor")).toBe("editor");
    expect(parseRole("")).toBeNull();
    expect(parseRole(undefined)).toBeNull();
    expect(parseRole(42)).toBeNull();
  });
});

describe("media authorization", () => {
  it("denies anonymous users any media management", () => {
    expect(canManageMedia(null)).toBe(false);
    expect(canManageMedia(undefined)).toBe(false);
    expect(canDeleteMedia(null)).toBe(false);
  });

  it("lets an editor upload and manage media metadata", () => {
    expect(canManageMedia("editor")).toBe(true);
  });

  it("reserves media deletion for admins", () => {
    expect(canDeleteMedia("editor")).toBe(false);
    expect(canDeleteMedia("admin")).toBe(true);
  });

  it("grants admins full media management", () => {
    expect(canManageMedia("admin")).toBe(true);
  });
});

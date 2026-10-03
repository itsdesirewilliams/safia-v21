import { describe, expect, it } from "vitest";

import {
  canAccessAdmin,
  canDeleteMedia,
  canDeletePosts,
  canManageAdminOnlyMedia,
  canManageBucket,
  canManageMedia,
  canManagePosts,
  canManageSettings,
  canManageUsers,
  isRole,
  parseRole,
} from "@/lib/auth/roles";

describe("role parsing", () => {
  it("recognises the three canonical roles", () => {
    expect(isRole("admin")).toBe(true);
    expect(isRole("operator")).toBe(true);
    expect(isRole("copywriter")).toBe(true);
    expect(isRole("editor")).toBe(false);
    expect(isRole("owner")).toBe(false);
    expect(isRole(null)).toBe(false);
  });

  it("parses unknown role values to null", () => {
    expect(parseRole("admin")).toBe("admin");
    expect(parseRole("operator")).toBe("operator");
    expect(parseRole("copywriter")).toBe("copywriter");
    expect(parseRole("editor")).toBeNull();
    expect(parseRole("")).toBeNull();
    expect(parseRole(undefined)).toBeNull();
    expect(parseRole(42)).toBeNull();
  });
});

describe("admin access", () => {
  it("admits any of the three roles and denies signed-out users", () => {
    expect(canAccessAdmin("admin")).toBe(true);
    expect(canAccessAdmin("operator")).toBe(true);
    expect(canAccessAdmin("copywriter")).toBe(true);
    expect(canAccessAdmin(null)).toBe(false);
  });
});

describe("media authorization", () => {
  it("denies anonymous users any media management", () => {
    expect(canManageMedia(null)).toBe(false);
    expect(canManageMedia(undefined)).toBe(false);
    expect(canDeleteMedia(null)).toBe(false);
  });

  it("lets admins and operators manage media, but not copywriters", () => {
    expect(canManageMedia("admin")).toBe(true);
    expect(canManageMedia("operator")).toBe(true);
    expect(canManageMedia("copywriter")).toBe(false);
  });

  it("allows admins and operators to delete media", () => {
    expect(canDeleteMedia("admin")).toBe(true);
    expect(canDeleteMedia("operator")).toBe(true);
    expect(canDeleteMedia("copywriter")).toBe(false);
  });

  it("reserves restricted (Quality First and Gallery) media for admins and operators", () => {
    expect(canManageAdminOnlyMedia("admin")).toBe(true);
    expect(canManageAdminOnlyMedia("operator")).toBe(true);
    expect(canManageAdminOnlyMedia("copywriter")).toBe(false);
    expect(canManageAdminOnlyMedia(null)).toBe(false);
  });

  it("limits a copywriter to the blog-images bucket", () => {
    expect(canManageBucket("admin", "gallery")).toBe(true);
    expect(canManageBucket("operator", "testing-videos")).toBe(true);
    expect(canManageBucket("copywriter", "blog-images")).toBe(true);
    expect(canManageBucket("copywriter", "gallery")).toBe(false);
    expect(canManageBucket("copywriter", "product-images")).toBe(false);
  });
});

describe("posts, settings and users authorization", () => {
  it("lets all three roles manage posts", () => {
    expect(canManagePosts("admin")).toBe(true);
    expect(canManagePosts("operator")).toBe(true);
    expect(canManagePosts("copywriter")).toBe(true);
    expect(canManagePosts(null)).toBe(false);
  });

  it("reserves post deletion for admins and operators", () => {
    expect(canDeletePosts("admin")).toBe(true);
    expect(canDeletePosts("operator")).toBe(true);
    expect(canDeletePosts("copywriter")).toBe(false);
  });

  it("reserves theme/settings for admins and operators", () => {
    expect(canManageSettings("admin")).toBe(true);
    expect(canManageSettings("operator")).toBe(true);
    expect(canManageSettings("copywriter")).toBe(false);
  });

  it("reserves user management for admins only", () => {
    expect(canManageUsers("admin")).toBe(true);
    expect(canManageUsers("operator")).toBe(false);
    expect(canManageUsers("copywriter")).toBe(false);
  });
});

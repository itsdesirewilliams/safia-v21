import type { StorageBucketId } from "@/lib/supabase/buckets";

/**
 * The three-role permission model.
 *
 * Stored as `public.profiles.role` and enforced by Postgres RLS; the helpers
 * here mirror that model for the server guards and the admin UI. Never trust
 * the client — `require*` guards in `session.ts` are the boundary.
 *
 *   admin      — everything, including user management
 *   operator   — everything except user management
 *   copywriter — blog/posts only (and the `blog-images` bucket)
 */
export const ROLES = ["admin", "operator", "copywriter"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function parseRole(value: unknown): Role | null {
  return isRole(value) ? value : null;
}

/** Any signed-in user with one of the three roles may reach the admin. */
export function canAccessAdmin(role: Role | null | undefined): boolean {
  return isRole(role);
}

/** Admin + operator manage all media; copywriter cannot reach media modules. */
export function canManageMedia(role: Role | null | undefined): boolean {
  return role === "admin" || role === "operator";
}

/** Gallery + Quality First buckets are managed by admin and operator. */
export function canManageAdminOnlyMedia(
  role: Role | null | undefined,
): boolean {
  return role === "admin" || role === "operator";
}

/** All three roles may create, edit and publish posts. */
export function canManagePosts(role: Role | null | undefined): boolean {
  return role === "admin" || role === "operator" || role === "copywriter";
}

/** Only admin and operator may delete posts. */
export function canDeletePosts(role: Role | null | undefined): boolean {
  return role === "admin" || role === "operator";
}

/** Admin + operator manage media deletion. */
export function canDeleteMedia(role: Role | null | undefined): boolean {
  return role === "admin" || role === "operator";
}

/** Admin + operator change the theme and site settings. */
export function canManageSettings(role: Role | null | undefined): boolean {
  return role === "admin" || role === "operator";
}

/** Only admins manage users. */
export function canManageUsers(role: Role | null | undefined): boolean {
  return role === "admin";
}

/**
 * Whether a role may write to a bucket. Admin/operator may manage all six;
 * a copywriter may only write to `blog-images` (for post media).
 */
export function canManageBucket(
  role: Role | null | undefined,
  bucket: StorageBucketId,
): boolean {
  if (role === "admin" || role === "operator") {
    return true;
  }
  return role === "copywriter" && bucket === "blog-images";
}

/** A short, human label for a role in the admin UI. */
export function roleLabel(role: Role): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "operator":
      return "Operator";
    case "copywriter":
      return "Copywriter";
  }
}

/** A one-line description of what a role may do, for the Users screen. */
export function roleDescription(role: Role): string {
  switch (role) {
    case "admin":
      return "Full access, including user management.";
    case "operator":
      return "Manages media, posts, themes and settings (no user management).";
    case "copywriter":
      return "Writes and publishes blog posts only.";
  }
}

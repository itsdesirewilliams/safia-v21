/**
 * The two-role permission model (spec #2). Stored as a `role` column on the
 * user profile and enforced via Postgres RLS; never via JWT claims.
 */
export const ROLES = ["admin", "editor"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function parseRole(value: unknown): Role | null {
  return isRole(value) ? value : null;
}

/** Admins and editors may upload media and edit its metadata. */
export function canManageMedia(role: Role | null | undefined): boolean {
  return role === "admin" || role === "editor";
}

/** Only admins may delete media (spec #2 user story 16). */
export function canDeleteMedia(role: Role | null | undefined): boolean {
  return role === "admin";
}

/** A short, human label for a role in the admin UI. */
export function roleLabel(role: Role): string {
  return role === "admin" ? "Admin" : "Editor";
}

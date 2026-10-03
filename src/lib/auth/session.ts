import { cache } from "react";
import { redirect } from "next/navigation";

import {
  canAccessAdmin,
  canManageMedia,
  canManagePosts,
  canManageSettings,
  canManageUsers,
  parseRole,
  type Role,
} from "./roles";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server-side session + authorization helpers for the admin.
 *
 * Authorization is always resolved from `public.profiles.role` on the server —
 * never from client input and never from JWT claims. These helpers are the
 * security boundary; the admin UI hides navigation only as a convenience, so a
 * copywriter cannot reach a media endpoint by typing its URL, and an operator
 * cannot reach user management.
 */

export type SessionProfile = {
  id: string;
  email: string | null;
  role: Role | null;
};

export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin";

/** The signed-in user's profile with its role, or null when signed out. */
export const getCurrentProfile = cache(
  async (): Promise<SessionProfile | null> => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", user.id)
      .maybeSingle<{ id: string; email: string | null; role: string | null }>();

    return {
      id: user.id,
      email: user.email ?? data?.email ?? null,
      role: parseRole(data?.role),
    };
  },
);

function forbidden(): never {
  redirect(`${ADMIN_LOGIN_PATH}?error=forbidden`);
}

/** Require any signed-in admin user (one of the three roles). */
export async function requireUser(): Promise<SessionProfile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(ADMIN_LOGIN_PATH);
  }

  if (!canAccessAdmin(profile.role)) {
    forbidden();
  }

  return profile;
}

/** Require admin or operator (full media management). */
export async function requireMediaManager(): Promise<SessionProfile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(ADMIN_LOGIN_PATH);
  }

  if (!canManageMedia(profile.role)) {
    forbidden();
  }

  return profile;
}

/** Require any role with blog access (admin, operator or copywriter). */
export async function requirePostsAccess(): Promise<SessionProfile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(ADMIN_LOGIN_PATH);
  }

  if (!canManagePosts(profile.role)) {
    forbidden();
  }

  return profile;
}

/** Require admin or operator (theme + site settings). */
export async function requireSettingsAccess(): Promise<SessionProfile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(ADMIN_LOGIN_PATH);
  }

  if (!canManageSettings(profile.role)) {
    forbidden();
  }

  return profile;
}

/** Require a full admin (user management and other privileged operations). */
export async function requireAdmin(): Promise<SessionProfile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(ADMIN_LOGIN_PATH);
  }

  if (!canManageUsers(profile.role)) {
    forbidden();
  }

  return profile;
}

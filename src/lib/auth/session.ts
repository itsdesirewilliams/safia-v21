import { cache } from "react";
import { redirect } from "next/navigation";

import { canDeleteMedia, canManageMedia, parseRole, type Role } from "./roles";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server-side session + authorization helpers for the admin (Ticket 4).
 *
 * Authorization is always resolved from `public.profiles.role` on the server —
 * never from client input and never from JWT claims. These helpers are the
 * security boundary; the admin UI hides controls only as a convenience.
 */

export type SessionProfile = {
  id: string;
  email: string | null;
  role: Role | null;
};

export const ADMIN_LOGIN_PATH = "/admin/login";

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

/**
 * Require an admin or editor. Redirects to the login screen when signed out or
 * lacking a role.
 */
export async function requireMediaManager(): Promise<SessionProfile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(ADMIN_LOGIN_PATH);
  }

  if (!canManageMedia(profile.role)) {
    redirect(`${ADMIN_LOGIN_PATH}?error=forbidden`);
  }

  return profile;
}

/** Require a full admin (deletion and other privileged operations). */
export async function requireAdmin(): Promise<SessionProfile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(ADMIN_LOGIN_PATH);
  }

  if (!canDeleteMedia(profile.role)) {
    redirect(`${ADMIN_LOGIN_PATH}?error=forbidden`);
  }

  return profile;
}

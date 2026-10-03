import { parseRole, type Role } from "@/lib/auth/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Server-only user administration over Supabase Auth (the project's single auth
 * system). Uses the service-role client, so it must only ever be called from a
 * server action/page guarded by `requireAdmin`. Passwords are never read or
 * exposed — users are invited, not given a password here.
 */

export type AdminUser = {
  id: string;
  email: string | null;
  role: Role | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  disabled: boolean;
};

type AuthUserRow = {
  id: string;
  email?: string | null;
  created_at?: string | null;
  last_sign_in_at?: string | null;
  banned_until?: string | null;
};

function isDisabled(user: AuthUserRow): boolean {
  if (!user.banned_until) {
    return false;
  }
  const bannedUntil = new Date(user.banned_until).getTime();
  return Number.isFinite(bannedUntil) && bannedUntil > Date.now();
}

/** Every user, with their role and account status, newest first. */
export async function listAdminUsers(): Promise<AdminUser[]> {
  const admin = createSupabaseAdminClient();

  const [usersResult, profilesResult] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from("profiles").select("id, role"),
  ]);

  if (usersResult.error) {
    throw new Error(usersResult.error.message);
  }

  const roleById = new Map<string, Role | null>(
    (profilesResult.data ?? []).map((row) => [
      (row as { id: string }).id,
      parseRole((row as { role: string | null }).role),
    ]),
  );

  return (usersResult.data.users as AuthUserRow[])
    .map((user) => ({
      id: user.id,
      email: user.email ?? null,
      role: roleById.get(user.id) ?? null,
      createdAt: user.created_at ?? null,
      lastSignInAt: user.last_sign_in_at ?? null,
      disabled: isDisabled(user),
    }))
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

export type UserActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

/** Invite a new user by email and assign their role. */
export async function inviteUser(
  email: string,
  role: Role,
): Promise<UserActionResult> {
  const admin = createSupabaseAdminClient();

  const invited = await admin.auth.admin.inviteUserByEmail(email);
  if (invited.error || !invited.data.user) {
    return {
      ok: false,
      error: invited.error?.message ?? "Could not invite that email address.",
    };
  }

  const userId = invited.data.user.id;
  const profile = await admin
    .from("profiles")
    .upsert({ id: userId, email, role }, { onConflict: "id" });

  if (profile.error) {
    return {
      ok: false,
      error: `User invited, but the role could not be saved: ${profile.error.message}`,
    };
  }

  return { ok: true, message: `Invited ${email} as ${role}.` };
}

/** Change an existing user's role. */
export async function updateUserRole(
  userId: string,
  role: Role,
): Promise<UserActionResult> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("profiles")
    .upsert({ id: userId, role }, { onConflict: "id" });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, message: "Role updated." };
}

/** Disable (ban) or re-enable a user without deleting them. */
export async function setUserDisabled(
  userId: string,
  disabled: boolean,
): Promise<UserActionResult> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: disabled ? "876000h" : "none",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    message: disabled ? "User disabled." : "User re-enabled.",
  };
}

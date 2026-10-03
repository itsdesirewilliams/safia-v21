"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { inviteUser, setUserDisabled, updateUserRole } from "@/lib/admin/users";
import { isRole } from "@/lib/auth/roles";
import { requireAdmin } from "@/lib/auth/session";

const USERS_PATH = "/admin/users";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type UserActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const INITIAL_USER_ACTION_STATE: UserActionState = { status: "idle" };

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Invite a user by email and assign a role (Admin only). */
export async function inviteUserAction(
  _previous: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  await requireAdmin();

  const email = readField(formData, "email").toLowerCase();
  const role = readField(formData, "role");

  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  if (!isRole(role)) {
    return { status: "error", message: "Choose a valid role." };
  }

  const result = await inviteUser(email, role);
  if (!result.ok) {
    return { status: "error", message: result.error };
  }

  revalidatePath(USERS_PATH);
  return { status: "success", message: result.message };
}

/** Change a user's role (Admin only). An admin cannot demote themselves. */
export async function updateUserRoleAction(formData: FormData): Promise<void> {
  const profile = await requireAdmin();

  const userId = readField(formData, "userId");
  const role = readField(formData, "role");

  if (!userId || !isRole(role)) {
    redirect(`${USERS_PATH}?error=invalid`);
  }

  if (userId === profile.id && role !== "admin") {
    redirect(`${USERS_PATH}?error=self`);
  }

  const result = await updateUserRole(userId, role);
  revalidatePath(USERS_PATH);
  redirect(result.ok ? `${USERS_PATH}?saved=role` : `${USERS_PATH}?error=save`);
}

/** Disable or re-enable a user (Admin only). An admin cannot disable themselves. */
export async function setUserStatusAction(formData: FormData): Promise<void> {
  const profile = await requireAdmin();

  const userId = readField(formData, "userId");
  const disabled = readField(formData, "disabled") === "true";

  if (!userId) {
    redirect(`${USERS_PATH}?error=invalid`);
  }

  if (userId === profile.id && disabled) {
    redirect(`${USERS_PATH}?error=self`);
  }

  const result = await setUserDisabled(userId, disabled);
  revalidatePath(USERS_PATH);
  redirect(result.ok ? `${USERS_PATH}?saved=status` : `${USERS_PATH}?error=save`);
}

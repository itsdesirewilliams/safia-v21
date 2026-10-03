"use server";

import { redirect } from "next/navigation";

import { requireSettingsAccess } from "@/lib/auth/session";
import { isThemeId } from "@/lib/theme/config";
import { setActiveTheme } from "@/lib/theme/persistence";

const APPEARANCE_PATH = "/admin/appearance";

/**
 * Save the active public website theme.
 *
 * Guarded by `requireSettingsAccess`, so only an admin or operator can change
 * it. The value is written server-side and the theme cache is invalidated, so
 * the public site updates on the next request.
 */
export async function setThemeAction(formData: FormData): Promise<void> {
  await requireSettingsAccess();

  const theme = String(formData.get("theme") ?? "");

  if (!isThemeId(theme)) {
    redirect(`${APPEARANCE_PATH}?error=invalid`);
  }

  try {
    await setActiveTheme(theme);
  } catch {
    redirect(`${APPEARANCE_PATH}?error=save`);
  }

  redirect(`${APPEARANCE_PATH}?saved=1`);
}

"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/session";
import { isThemeId } from "@/lib/theme/config";
import { setActiveTheme } from "@/lib/theme/persistence";

/**
 * Save the active public website theme.
 *
 * Guarded by `requireAdmin`, so only a full Admin — never an editor or a
 * signed-out visitor — can change it. The value is written server-side and the
 * theme cache is invalidated, so the public site updates on the next request.
 */
export async function setThemeAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const theme = String(formData.get("theme") ?? "");

  if (!isThemeId(theme)) {
    redirect("/admin/settings?error=invalid");
  }

  try {
    await setActiveTheme(theme);
  } catch {
    redirect("/admin/settings?error=save");
  }

  redirect("/admin/settings?saved=1");
}

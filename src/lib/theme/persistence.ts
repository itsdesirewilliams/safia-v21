import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import {
  DEFAULT_THEME_ID,
  parseThemeId,
  SITE_SETTINGS_TABLE,
  THEME_CACHE_TAG,
  THEME_SETTING_KEY,
  type ThemeId,
} from "./config";

/**
 * Server-only persistence for the active website theme.
 *
 * The value lives in one `site_settings` row (`key = 'theme'`) and is read
 * through a tagged cache so the public site can stay statically rendered: when
 * an Admin saves a new theme the tag is invalidated and the affected pages
 * regenerate on the next request — no rebuild or redeploy.
 *
 * Reading is defensive: a missing table/migration, a network error, or an
 * unrecognized value all fall back to Theme 1, so the public site never breaks
 * because of this feature.
 */

async function loadActiveTheme(): Promise<ThemeId> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from(SITE_SETTINGS_TABLE)
      .select("value")
      .eq("key", THEME_SETTING_KEY)
      .maybeSingle<{ value: { active?: unknown } | null }>();

    if (error) {
      return DEFAULT_THEME_ID;
    }

    return parseThemeId(data?.value?.active) ?? DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

/** The active public theme, cached under the `site-theme` tag. */
export const getActiveTheme = unstable_cache(
  loadActiveTheme,
  ["site-active-theme"],
  { tags: [THEME_CACHE_TAG] },
);

/**
 * Persist the active theme and invalidate the cache so the change is live on
 * the next request. This is only ever called from an admin-only server action.
 */
export async function setActiveTheme(id: ThemeId): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from(SITE_SETTINGS_TABLE)
    .upsert(
      { key: THEME_SETTING_KEY, value: { active: id } },
      { onConflict: "key" },
    );

  if (error) {
    throw new Error(`Could not save the active theme: ${error.message}`);
  }

  revalidateTag(THEME_CACHE_TAG, "max");
  // The theme is applied in the root layout, so refresh every route beneath it.
  revalidatePath("/", "layout");
}

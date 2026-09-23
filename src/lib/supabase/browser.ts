import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/config";

/** Supabase client for use in Client Components. */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}

import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/config";

/**
 * A request-independent Supabase client for public, RLS-protected reads (for
 * example the sitemap). It never carries a user session or service-role key.
 */
export function createPublicSupabaseClient() {
  const env = getSupabaseEnv();
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

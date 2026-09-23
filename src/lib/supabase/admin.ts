import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminEnv } from "@/lib/config";

/**
 * Server-only Supabase client using the service-role key. Never import this
 * into a Client Component.
 */
export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseAdminEnv();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

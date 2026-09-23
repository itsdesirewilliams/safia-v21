import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ConfigError, getSupabaseEnv } from "@/lib/config";

/**
 * Refreshes the Supabase session for admin routes and bounces signed-out users
 * to the login screen.
 *
 * This is a convenience layer only: authorization is enforced server-side in
 * the admin layout and actions (`requireMediaManager` / `requireAdmin`) against
 * `public.profiles.role`, so a skipped proxy cannot expose admin data.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  let env;
  try {
    env = getSupabaseEnv();
  } catch (error) {
    if (error instanceof ConfigError) {
      return response;
    }
    throw error;
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";

  if (pathname.startsWith("/admin") && !isLoginRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

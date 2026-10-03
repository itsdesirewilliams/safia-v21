import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ConfigError, getSupabaseEnv } from "@/lib/config";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  type Locale,
} from "@/lib/i18n/config";

/**
 * Request proxy (Next.js middleware).
 *
 * Two responsibilities:
 *  1. Refresh the Supabase session for `/admin` and bounce signed-out users to
 *     the login screen. Authorization itself is enforced server-side in the
 *     admin layout and actions — this is only a convenience.
 *  2. Locale routing for the public site. English stays on the canonical root
 *     URLs; `/es`, `/pt` and `/ar` are rewritten to the same page tree with an
 *     `x-safeway-locale` request header, so server components render the right
 *     language with no client round-trip. `/en/...` permanently redirects to the
 *     unprefixed URL to avoid duplicate content.
 */

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type PrefixedLocale = "es" | "pt" | "ar";

function isPrefixedLocale(value: string | undefined): value is PrefixedLocale {
  return value === "es" || value === "pt" || value === "ar";
}

function requestWithLocale(
  request: NextRequest,
  locale: Locale,
): Headers {
  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);
  return headers;
}

function persistLocale(response: NextResponse, locale: Locale): NextResponse {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Admin: session refresh only, always English/LTR -------------------
  if (pathname.startsWith("/admin")) {
    let response = NextResponse.next({
      request: { headers: requestWithLocale(request, DEFAULT_LOCALE) },
    });

    try {
      const env = getSupabaseEnv();
      const supabase = createServerClient(env.url, env.anonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value } of cookiesToSet) {
              request.cookies.set(name, value);
            }
            response = NextResponse.next({
              request: { headers: requestWithLocale(request, DEFAULT_LOCALE) },
            });
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const isLoginRoute = pathname === "/admin/login";
      if (!isLoginRoute && !user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/admin/login";
        loginUrl.search = "";
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      if (!(error instanceof ConfigError)) {
        throw error;
      }
    }

    return response;
  }

  // --- Public site: locale routing --------------------------------------
  const segment = pathname.split("/")[1] ?? "";

  // `/en/...` → canonical unprefixed URL (permanent).
  if (segment === "en") {
    const url = request.nextUrl.clone();
    const rest = pathname.slice("/en".length);
    url.pathname = rest === "" ? "/" : rest;
    return NextResponse.redirect(url, 308);
  }

  // `/es|/pt|/ar/...` → rewrite to the shared tree with the locale header.
  if (isPrefixedLocale(segment)) {
    const url = request.nextUrl.clone();
    const rest = pathname.slice(`/${segment}`.length);
    url.pathname = rest === "" ? "/" : rest;

    const response = NextResponse.rewrite(url, {
      request: { headers: requestWithLocale(request, segment) },
    });
    return persistLocale(response, segment);
  }

  // English (canonical). Returning visitors who chose another language are
  // sent to their locale from the homepage only, so deep English links are
  // never hijacked.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (pathname === "/" && isPrefixedLocale(cookieLocale)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${cookieLocale}`;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next({
    request: { headers: requestWithLocale(request, DEFAULT_LOCALE) },
  });
  return persistLocale(response, DEFAULT_LOCALE);
}

export const config = {
  matcher: [
    // Everything except Next internals, the API and static brand/media assets.
    "/((?!_next/static|_next/image|api/|brand/|media/|assets/|fonts/|favicon.ico).*)",
  ],
};

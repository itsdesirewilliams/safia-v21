import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ConfigError, getSupabaseEnv } from "@/lib/config";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_HEADER,
  LOCALE_REWRITE_HEADER,
  isPrefixedLocale,
  type Locale,
} from "@/lib/i18n/config";

/**
 * Request proxy (Next.js middleware).
 *
 * Two responsibilities:
 *  1. Refresh the Supabase session for `/admin` and bounce signed-out users to
 *     the login screen. Authorization itself is enforced server-side in the
 *     admin layout and actions – this is only a convenience.
 *  2. Locale routing for the public site. English stays on the canonical root
 *     URLs; every other locale (`/fr`, `/pt`, `/es`, `...`) is rewritten to the
 *     same page tree with an `x-safeway-locale` request header, so server
 *     components render the right language with no client round-trip.
 *     `/en/...` permanently redirects to the unprefixed URL to avoid duplicate
 *     content.
 *
 * The rewrite origin is forced to `http://` on purpose. When TLS terminates at
 * a reverse proxy (Nginx sends `X-Forwarded-Proto: https` but forwards to the
 * Node server over HTTP), `request.nextUrl` reports `https://<internal-host>`
 * while the server's own origin is `http://<internal-host>`. Next then treats
 * the rewrite as an external proxy request, fails the TLS handshake against
 * the app itself and re-enters this proxy (resetting the locale cookie).
 * Matching the server's real internal scheme keeps it an in-process rewrite.
 */

function requestWithLocale(
  request: NextRequest,
  locale: Locale,
  internalRewrite = false,
): Headers {
  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);
  if (internalRewrite) {
    headers.set(LOCALE_REWRITE_HEADER, "1");
  }
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

/**
 * Rewrite a prefixed locale path to the shared page tree with an internal
 * origin, and remember the chosen language.
 */
function rewriteLocale(
  request: NextRequest,
  pathname: string,
  search: string,
  locale: Locale,
): NextResponse {
  const url = request.nextUrl.clone();
  // `next start` always serves plain HTTP; TLS is terminated by the reverse
  // proxy. Keep the rewrite origin identical to the internal request origin so
  // Next resolves it as an in-process rewrite instead of proxying over TLS.
  url.protocol = "http:";
  url.pathname = pathname;
  url.search = search;

  const response = NextResponse.rewrite(url, {
    request: { headers: requestWithLocale(request, locale, true) },
  });

  return persistLocale(response, locale);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

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

  // A rewrite we issued ourselves already carries the locale. Never clobber
  // it (which would reset both the header and the cookie to English).
  if (request.headers.get(LOCALE_REWRITE_HEADER) === "1") {
    return NextResponse.next();
  }

  const segment = pathname.split("/")[1] ?? "";

  // `/en/...` → canonical unprefixed URL (permanent).
  if (segment === "en") {
    const url = request.nextUrl.clone();
    const rest = pathname.slice("/en".length);
    url.pathname = rest === "" ? "/" : rest;
    return NextResponse.redirect(url, 308);
  }

  // `/fr|/pt|/es/...` → rewrite to the shared tree with the locale header.
  if (isPrefixedLocale(segment)) {
    const rest = pathname.slice(`/${segment}`.length);
    return rewriteLocale(request, rest === "" ? "/" : rest, search, segment);
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

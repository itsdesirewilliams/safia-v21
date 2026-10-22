/**
 * Load a path as a full document navigation.
 *
 * Every language is served from the same route: the proxy rewrites
 * `/fr/about-us` to `/about-us` and carries the locale on a request header.
 * A client-side navigation to another language therefore resolves to a route
 * the router already has, and it keeps the segments it has already rendered —
 * the page stays in the previous language even though the URL changed.
 *
 * A document navigation asks the server for the page again, so the page, the
 * header, the navigation and the document direction are all rendered in the
 * chosen language in one go. It is the only reliable way to change the
 * language of a server-rendered page in this architecture.
 */
export function navigateToPath(href: string): void {
  window.location.assign(href);
}

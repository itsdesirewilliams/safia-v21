# Ten languages, URL-prefixed, switched with a refetch of the server tree

The public site is served in ten languages: English, French, Portuguese, Spanish, German, Dutch, Polish, Russian, Swahili and Arabic. English stays on the canonical root URLs; every other language is served under a URL prefix (`/fr/...`, `/ar/...`) that the proxy rewrites to the same page tree with an `x-safeway-locale` request header, so server components render the right language with no client round-trip. The chosen language is remembered in the `NEXT_LOCALE` cookie.

Two decisions are worth recording.

**A language is not a country.** Each locale carries one *reference country* — the country its translation is written for. The flag shown beside a language in the selector is that country's flag, not a claim about where the language is spoken. English is represented by the United Kingdom, Swahili by Kenya, Arabic by Egypt.

**Switching a language must re-fetch the server tree.** Because every language resolves to the same route, a client-side navigation to `/fr/about-us` resolves to the `/about-us` route: the App Router keeps the segments it already has and the page stays in the previous language, even though the URL and the header change. The selector therefore writes the locale cookie, navigates to the new prefixed URL and then refreshes the router, which re-fetches the tree for that URL and swaps the cached segments. The alternative — a full document navigation — was rejected because it discards the SPA behaviour for a change the router can express.

## Considered Options

- **Rewrite + refresh (chosen):** one route tree, one dictionary mechanism, no duplicated pages; the switch costs one extra router refresh.
- **A `[locale]` route segment for every page:** the locale would be part of the route, so the router cache would key on it naturally. Rejected: it duplicates the whole page tree and breaks the canonical English URLs.
- **Full document navigation on switch:** always correct, but a full page load for a language change.
- **Client-side dictionaries:** the page would have to be re-rendered from a client dictionary, which means converting the server-rendered pages to client components and losing server-side data fetching.

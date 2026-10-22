# Ten languages, URL-prefixed, switched with a document navigation

The public site is served in ten languages: English, French, Portuguese, Spanish, German, Dutch, Polish, Russian, Swahili and Arabic. English stays on the canonical root URLs; every other language is served under a URL prefix (`/fr/...`, `/ar/...`) that the proxy rewrites to the same page tree with an `x-safeway-locale` request header, so server components render the right language with no client round-trip. The chosen language is remembered in the `NEXT_LOCALE` cookie.

Two decisions are worth recording.

**A language is not a country.** Each locale carries one *reference country* — the country its translation is written for. The flag shown beside a language in the selector is that country's flag, not a claim about where the language is spoken. English is represented by the United Kingdom, Swahili by Kenya, Arabic by Egypt.

**Switching a language is a document navigation.** Because every language resolves to the same route, a client-side navigation to `/fr/about-us` resolves to the `/about-us` route: the App Router keeps the route segments it already has and the page stays in the previous language, even though the URL changes. A client-side navigation plus a router refresh was tried and is not dependable in production — the refreshed tree is discarded and the page keeps the previous language. Loading the page again is the only reliable way to change the language of a server-rendered page in this architecture, so the selector remembers the language in the cookie and then navigates to the new URL as a document. The selector also does not prefetch the language URLs: a prefetch would fetch every language page and overwrite the remembered language.

## Considered Options

- **Document navigation (chosen):** the server renders the page, the header, the navigation and the document direction in the chosen language in one go. Costs a page load.
- **Rewrite + client-side navigation + router refresh:** no page load, but the refreshed tree is discarded in production and the page stays in the previous language.
- **A `[locale]` route segment for every page:** the locale would be part of the route, so the router cache would key on it naturally. Rejected: it duplicates the whole page tree and breaks the canonical English URLs.
- **Client-side dictionaries:** the page would have to be re-rendered from a client dictionary, which means converting the server-rendered pages to client components and losing server-side data fetching.

# Homepage Instagram feed uses the Instagram Graph API (server-side, cached)

The Homepage shows the four most recent Instagram posts fetched server-side via the Instagram Graph API, cached and revalidated periodically, with the section hidden gracefully if the fetch fails. We chose this over a client-side Instagram embed script (fragile, little control over layout/count) and static screenshots (goes stale, manual upkeep) because a "most recent posts" feed must stay live. The trade-off is a hard external dependency: a long-lived Instagram access token must be provisioned and rotated, and Instagram's API/rate limits shape availability.

## Considered Options

- **Instagram Graph API (server-side + cache):** live, controllable post count and layout; requires a long-lived access token and cache/fallback handling.
- **Client-side embed script:** no token, but fragile and little control over rendering or "4 most recent" behaviour.
- **Static screenshots:** no dependency, but manual and stale.

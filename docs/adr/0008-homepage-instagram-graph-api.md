# Homepage Instagram feed uses the Instagram Graph API (server-side, cached)

> **Superseded.** The homepage Instagram section now reads local images from
> `public/assets/instagram` at read time and rotates four of them; the Graph
> API, the long-lived token and `INSTAGRAM_ACCESS_TOKEN` have been removed. See
> "Superseded" below.

The Homepage shows the four most recent Instagram posts fetched server-side via the Instagram Graph API, cached and revalidated periodically, with the section hidden gracefully if the fetch fails. We chose this over a client-side Instagram embed script (fragile, little control over layout/count) and static screenshots (goes stale, manual upkeep) because a "most recent posts" feed must stay live. The trade-off is a hard external dependency: a long-lived Instagram access token must be provisioned and rotated, and Instagram's API/rate limits shape availability.

## Considered Options

- **Instagram Graph API (server-side + cache):** live, controllable post count and layout; requires a long-lived access token and cache/fallback handling.
- **Client-side embed script:** no token, but fragile and little control over rendering or "4 most recent" behaviour.
- **Static screenshots:** no dependency, but manual and stale.

## Superseded

Superseded by the **local Instagram image system**: the homepage discovers
supported images in `public/assets/instagram` at read time and shows four at a
time, quietly replacing one every five minutes. Adding an image is a matter of
dropping a file into the folder, and the Graph API dependency, long-lived token
and `INSTAGRAM_ACCESS_TOKEN` are gone. The stale-screenshots trade-off no longer
applies because the folder is maintained directly.

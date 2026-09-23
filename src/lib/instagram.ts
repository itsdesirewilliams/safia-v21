import { getOptionalInstagramAccessToken } from "@/lib/config";

/**
 * Server-side Instagram feed for the homepage (ADR-0008).
 *
 * Posts are fetched from the Instagram Graph API, cached and revalidated, and
 * limited to the four most recent. This is deliberately *not* the Gallery and
 * does not read Gallery storage. When the long-lived token is absent the
 * caller renders a labelled placeholder; when the fetch fails the caller hides
 * the section.
 */

export type InstagramPost = {
  id: string;
  permalink: string;
  /** Image used for the 4:5 tile. */
  imageUrl: string;
  caption: string | null;
  mediaType: string;
};

export const INSTAGRAM_POST_COUNT = 4;
export const INSTAGRAM_REVALIDATE_SECONDS = 3600;

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Defensively map a Graph API payload to at most four usable posts. */
export function parseInstagramMedia(payload: unknown): InstagramPost[] {
  if (typeof payload !== "object" || payload === null) {
    return [];
  }

  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) {
    return [];
  }

  const posts: InstagramPost[] = [];
  for (const item of data) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const record = item as Record<string, unknown>;
    const id = asString(record.id);
    const permalink = asString(record.permalink);
    const mediaUrl = asString(record.media_url);
    const thumbnailUrl = asString(record.thumbnail_url);
    const mediaType = asString(record.media_type) ?? "IMAGE";

    // Videos expose only a thumbnail; images expose media_url.
    const imageUrl = mediaType === "VIDEO" ? thumbnailUrl : mediaUrl;

    if (!id || !permalink || !imageUrl) {
      continue;
    }

    posts.push({
      id,
      permalink,
      imageUrl,
      caption: asString(record.caption),
      mediaType,
    });

    if (posts.length === INSTAGRAM_POST_COUNT) {
      break;
    }
  }

  return posts;
}

/**
 * Fetch the four most recent posts. Returns `[]` when no token is configured;
 * throws when a configured token's request fails so the caller can hide the
 * section.
 */
export async function fetchInstagramPosts(): Promise<InstagramPost[]> {
  const token = getOptionalInstagramAccessToken();
  if (!token) {
    return [];
  }

  const params = new URLSearchParams({
    fields: "id,caption,media_type,media_url,thumbnail_url,permalink",
    limit: String(INSTAGRAM_POST_COUNT),
    access_token: token,
  });

  const response = await fetch(
    `https://graph.instagram.com/me/media?${params.toString()}`,
    { next: { revalidate: INSTAGRAM_REVALIDATE_SECONDS } },
  );

  if (!response.ok) {
    throw new Error(`Instagram feed request failed: ${response.status}`);
  }

  return parseInstagramMedia(await response.json());
}

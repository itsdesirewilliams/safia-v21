import { afterEach, describe, expect, it, vi } from "vitest";

import {
  INSTAGRAM_POST_COUNT,
  fetchInstagramPosts,
  parseInstagramMedia,
} from "@/lib/instagram";

afterEach(() => {
  vi.unstubAllEnvs();
});

function media(id: string, type = "IMAGE") {
  return {
    id,
    media_type: type,
    media_url: `https://cdn.example/${id}.jpg`,
    thumbnail_url: `https://cdn.example/${id}-thumb.jpg`,
    permalink: `https://instagram.com/p/${id}`,
    caption: `Post ${id}`,
  };
}

describe("parseInstagramMedia", () => {
  it("returns at most the four most recent posts", () => {
    const payload = { data: ["1", "2", "3", "4", "5"].map((id) => media(id)) };
    const posts = parseInstagramMedia(payload);
    expect(posts).toHaveLength(INSTAGRAM_POST_COUNT);
    expect(posts.map((post) => post.id)).toEqual(["1", "2", "3", "4"]);
  });

  it("uses the thumbnail for video posts", () => {
    const posts = parseInstagramMedia({ data: [media("vid", "VIDEO")] });
    expect(posts[0].imageUrl).toBe("https://cdn.example/vid-thumb.jpg");
  });

  it("skips entries without a permalink or usable image", () => {
    const posts = parseInstagramMedia({
      data: [
        { id: "x", media_type: "IMAGE" },
        { id: "y", permalink: "https://instagram.com/p/y" },
        media("good"),
      ],
    });
    expect(posts.map((post) => post.id)).toEqual(["good"]);
  });

  it("tolerates malformed payloads", () => {
    expect(parseInstagramMedia(null)).toEqual([]);
    expect(parseInstagramMedia({})).toEqual([]);
    expect(parseInstagramMedia({ data: "nope" })).toEqual([]);
  });
});

describe("fetchInstagramPosts", () => {
  it("returns nothing when no token is configured", async () => {
    vi.stubEnv("INSTAGRAM_ACCESS_TOKEN", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const posts = await fetchInstagramPosts();
    expect(posts).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

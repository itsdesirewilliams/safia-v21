import { describe, expect, it } from "vitest";

import {
  isValidYoutubeVideoId,
  youtubeEmbedUrl,
} from "@/lib/media/youtube";

const SUPPLIED_ID = "4jM2jUcc5Kc";

describe("youtube video id", () => {
  it("accepts the 11-character supplied id", () => {
    expect(isValidYoutubeVideoId(SUPPLIED_ID)).toBe(true);
    expect(isValidYoutubeVideoId("dQw4w9WgXcQ")).toBe(true);
  });

  it("rejects ids that are not 11 URL-safe characters", () => {
    for (const value of ["", "short", "toolongvideoid", "has space", "4jM2jUcc5K!"]) {
      expect(isValidYoutubeVideoId(value)).toBe(false);
    }
  });
});

describe("youtube embed url", () => {
  it("embeds on the privacy-preserving no-cookie host", () => {
    const url = youtubeEmbedUrl(SUPPLIED_ID);
    expect(url.startsWith("https://www.youtube-nocookie.com/embed/")).toBe(true);
    expect(url).toContain(SUPPLIED_ID);
    expect(url).toContain("playsinline=1");
    expect(url).not.toContain("autoplay=1");
    expect(url).not.toContain("mute=1");
  });

  it("adds autoplay, always muted, only when requested", () => {
    expect(youtubeEmbedUrl(SUPPLIED_ID, { autoplay: true })).toBe(
      `https://www.youtube-nocookie.com/embed/${SUPPLIED_ID}?rel=0&playsinline=1&autoplay=1&mute=1`,
    );
  });
});

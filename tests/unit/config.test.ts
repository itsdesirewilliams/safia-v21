import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ConfigError,
  DEFAULT_YOUTUBE_VIDEO_ID,
  getPublicConfig,
  getSupabaseAdminEnv,
  getSupabaseEnv,
  getYoutubeVideoId,
} from "@/lib/config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("required configuration", () => {
  it("fails loudly when Supabase URL and anon key are absent", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    expect(() => getSupabaseEnv()).toThrowError(ConfigError);

    try {
      getSupabaseEnv();
    } catch (error) {
      expect((error as ConfigError).missing).toEqual([
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ]);
    }
  });

  it("names only the missing service-role key for the admin client", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    try {
      getSupabaseAdminEnv();
      throw new Error("expected ConfigError");
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError);
      expect((error as ConfigError).missing).toEqual([
        "SUPABASE_SERVICE_ROLE_KEY",
      ]);
    }
  });

  it("reads values from the environment when present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    expect(getSupabaseEnv()).toEqual({
      url: "https://example.supabase.co",
      anonKey: "anon-key",
    });
  });
});

describe("homepage tour video configuration", () => {
  it("falls back to the supplied video id when none is configured", () => {
    vi.stubEnv("YOUTUBE_VIDEO_ID", "");

    expect(DEFAULT_YOUTUBE_VIDEO_ID).toBe("4jM2jUcc5Kc");
    expect(getYoutubeVideoId()).toBe(DEFAULT_YOUTUBE_VIDEO_ID);
  });

  it("uses a configured video id when present", () => {
    vi.stubEnv("YOUTUBE_VIDEO_ID", "dQw4w9WgXcQ");

    expect(getYoutubeVideoId()).toBe("dQw4w9WgXcQ");
  });
});

describe("public configuration", () => {
  it("omits social platforms that are not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SOCIAL_INSTAGRAM", "");
    vi.stubEnv("NEXT_PUBLIC_SOCIAL_X", "");

    const { socialLinks } = getPublicConfig();
    expect(socialLinks.map((link) => link.name)).not.toContain("Instagram");
    expect(socialLinks.map((link) => link.name)).not.toContain("X");
  });

  it("includes configured social platforms", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SOCIAL_INSTAGRAM",
      "https://instagram.com/safewaytyre",
    );
    vi.stubEnv("NEXT_PUBLIC_SOCIAL_PINTEREST", "");

    const { socialLinks } = getPublicConfig();
    expect(socialLinks).toContainEqual({
      name: "Instagram",
      url: "https://instagram.com/safewaytyre",
    });
  });
});

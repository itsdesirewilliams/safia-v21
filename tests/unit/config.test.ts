import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ConfigError,
  getOptionalInstagramAccessToken,
  getOptionalYoutubeVideoId,
  getPublicConfig,
  getSupabaseAdminEnv,
  getSupabaseEnv,
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

describe("optional homepage configuration", () => {
  it("returns null rather than throwing when inputs are absent", () => {
    vi.stubEnv("INSTAGRAM_ACCESS_TOKEN", "");
    vi.stubEnv("YOUTUBE_VIDEO_ID", "");

    expect(getOptionalInstagramAccessToken()).toBeNull();
    expect(getOptionalYoutubeVideoId()).toBeNull();
  });

  it("returns the configured values when present", () => {
    vi.stubEnv("INSTAGRAM_ACCESS_TOKEN", "ig-token");
    vi.stubEnv("YOUTUBE_VIDEO_ID", "dQw4w9WgXcQ");

    expect(getOptionalInstagramAccessToken()).toBe("ig-token");
    expect(getOptionalYoutubeVideoId()).toBe("dQw4w9WgXcQ");
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

/**
 * External configuration resolution.
 *
 * Deployment- and instance-specific values (Supabase keys, email transport,
 * YouTube ID, address, social URLs) are read from the environment here — never
 * hardcoded. Fixed, confirmed company content
 * (emails, phone, opening hours, navigation) lives in `src/lib/site.ts` and
 * `src/lib/routes.ts` as developer-owned content.
 *
 * Required values fail loudly with a `ConfigError` listing exactly what is
 * missing, rather than silently defaulting to invented values. See
 * `.env.example` for the full surface and `docs/missing-inputs.md` for what is
 * currently unsupplied.
 */

export class ConfigError extends Error {
  readonly missing: readonly string[];

  constructor(missing: readonly string[]) {
    super(
      `Missing required environment configuration: ${missing.join(", ")}. ` +
        "Set these values in the environment (see .env.example).",
    );
    this.name = "ConfigError";
    this.missing = missing;
  }
}

function readRequired(names: readonly string[]): Record<string, string> {
  const missing = names.filter((name) => {
    const value = process.env[name];
    return value === undefined || value.trim() === "";
  });

  if (missing.length > 0) {
    throw new ConfigError(missing);
  }

  return Object.fromEntries(
    names.map((name) => [name, process.env[name] as string]),
  );
}

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

/** The public Supabase project URL (used to resolve media URLs). */
export function getSupabaseUrl(): string {
  return readRequired(["NEXT_PUBLIC_SUPABASE_URL"]).NEXT_PUBLIC_SUPABASE_URL;
}

/** Public Supabase connection (browser and server, anon key). */
export function getSupabaseEnv(): SupabaseEnv {
  // Read these with *static* member access so Next.js inlines them into the
  // browser bundle. A dynamic `process.env[name]` lookup (as `readRequired`
  // uses) is not replaced at build time, which left the client-side Supabase
  // connection undefined in the browser and broke the Gallery bulk upload.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && url.trim() !== "" && anonKey && anonKey.trim() !== "") {
    return { url, anonKey };
  }

  const missing: string[] = [];
  if (!url || url.trim() === "") {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!anonKey || anonKey.trim() === "") {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  throw new ConfigError(missing);
}

export type SupabaseAdminEnv = {
  url: string;
  serviceRoleKey: string;
};

/** Server-only Supabase connection with the service-role key. */
export function getSupabaseAdminEnv(): SupabaseAdminEnv {
  const env = readRequired([
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

/**
 * The Resend API key used by the contact-form email transport (ADR-0007).
 * Server-only; never read in a Client Component.
 */
export function getResendApiKey(): string {
  return readRequired(["RESEND_API_KEY"]).RESEND_API_KEY;
}

/**
 * The supplied homepage tour video. Safeway has provided the id, so it is the
 * default; `YOUTUBE_VIDEO_ID` can still override it per environment.
 */
export const DEFAULT_YOUTUBE_VIDEO_ID = "4jM2jUcc5Kc";

/** YouTube video ID for the homepage "Take a Tour" embed. */
export function getYoutubeVideoId(): string {
  return optional("YOUTUBE_VIDEO_ID") ?? DEFAULT_YOUTUBE_VIDEO_ID;
}

/**
 * Optional catalogue download URL. The Catalogue slider surfaces a download
 * action only when Safeway has supplied a link, so this returns `null` rather
 * than throwing.
 */
export function getOptionalCatalogueDownloadUrl(): string | null {
  return optional("NEXT_PUBLIC_CATALOGUE_DOWNLOAD_URL");
}

/**
 * The homepage hero video. Safeway's final factory clip ships at
 * `public/media/hero-tour.mp4`, which is the default; `NEXT_PUBLIC_HERO_VIDEO_URL`
 * can still point at a remote source without a code change.
 */
export function getHeroVideoUrl(): string {
  return optional("NEXT_PUBLIC_HERO_VIDEO_URL") ?? "/media/hero-tour.mp4";
}

export type SocialLink = {
  name: string;
  url: string;
};

export type PublicConfig = {
  companyAddress: string | null;
  socialLinks: readonly SocialLink[];
};

function optional(name: string): string | null {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : null;
}

/**
 * Client-safe configuration. Only `NEXT_PUBLIC_*` values are read here so
 * they are inlined for the browser. Unset social platforms are omitted
 * rather than invented.
 */
export function getPublicConfig(): PublicConfig {
  const socialLinks = [
    { name: "Instagram", url: optional("NEXT_PUBLIC_SOCIAL_INSTAGRAM") },
    { name: "Facebook", url: optional("NEXT_PUBLIC_SOCIAL_FACEBOOK") },
    { name: "LinkedIn", url: optional("NEXT_PUBLIC_SOCIAL_LINKEDIN") },
    { name: "X", url: optional("NEXT_PUBLIC_SOCIAL_X") },
    { name: "Pinterest", url: optional("NEXT_PUBLIC_SOCIAL_PINTEREST") },
  ].filter((link): link is SocialLink => link.url !== null);

  return {
    companyAddress: optional("NEXT_PUBLIC_COMPANY_ADDRESS"),
    socialLinks,
  };
}

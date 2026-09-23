/**
 * External configuration resolution.
 *
 * Deployment- and instance-specific values (Supabase keys, email transport,
 * Instagram token, YouTube ID, address, social URLs) are read from the
 * environment here — never hardcoded. Fixed, confirmed company content
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
  const env = readRequired([
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]);

  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
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

export type EmailTransportEnv = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
};

/** Contact form email transport (provider deferred — ADR-0007). */
export function getEmailTransportEnv(): EmailTransportEnv {
  const env = readRequired([
    "EMAIL_TRANSPORT_HOST",
    "EMAIL_TRANSPORT_PORT",
    "EMAIL_TRANSPORT_USER",
    "EMAIL_TRANSPORT_PASSWORD",
    "EMAIL_TRANSPORT_FROM",
  ]);

  return {
    host: env.EMAIL_TRANSPORT_HOST,
    port: Number(env.EMAIL_TRANSPORT_PORT),
    user: env.EMAIL_TRANSPORT_USER,
    password: env.EMAIL_TRANSPORT_PASSWORD,
    from: env.EMAIL_TRANSPORT_FROM,
  };
}

/** Long-lived Instagram Graph API access token (ADR-0008). */
export function getInstagramAccessToken(): string {
  return readRequired(["INSTAGRAM_ACCESS_TOKEN"]).INSTAGRAM_ACCESS_TOKEN;
}

/**
 * Optional long-lived Instagram Graph API access token. The homepage feed
 * hides gracefully when this is absent (ADR-0008), so this getter returns
 * `null` instead of throwing.
 */
export function getOptionalInstagramAccessToken(): string | null {
  return optional("INSTAGRAM_ACCESS_TOKEN");
}

/**
 * Optional catalogue download URL. The Catalogue slider surfaces a download
 * action only when Safeway has supplied a link, so this returns `null` rather
 * than throwing.
 */
export function getOptionalCatalogueDownloadUrl(): string | null {
  return optional("NEXT_PUBLIC_CATALOGUE_DOWNLOAD_URL");
}

/** YouTube video ID for the homepage embed. */
export function getYoutubeVideoId(): string {
  return readRequired(["YOUTUBE_VIDEO_ID"]).YOUTUBE_VIDEO_ID;
}

/**
 * Optional YouTube video ID. The homepage tour renders a labelled placeholder
 * when this is absent, so this getter returns `null` instead of throwing.
 */
export function getOptionalYoutubeVideoId(): string | null {
  return optional("YOUTUBE_VIDEO_ID");
}

/**
 * Optional homepage hero background video. Falls back to the supplied
 * manufacturing-unit tour clip that ships in `public/media`; Safeway has not
 * supplied a final hero video yet, so this is a replaceable placeholder.
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

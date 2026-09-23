import type { MediaType } from "./types";

/**
 * Upload validation and storage-path construction (Ticket 4).
 *
 * Everything here is pure so it can be tested without a browser, filesystem or
 * Supabase connection. MIME type is the source of truth for the media type;
 * the filename only contributes a cosmetic label and is never trusted for
 * paths.
 */

/** Per-type upload ceilings. */
export const MAX_UPLOAD_BYTES: Record<MediaType, number> = {
  image: 10 * 1024 * 1024,
  video: 200 * 1024 * 1024,
  document: 25 * 1024 * 1024,
};

/** Allowed MIME types per media type. SVG is deliberately excluded. */
export const ALLOWED_MIME_TYPES: Record<MediaType, readonly string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  document: ["application/pdf"],
};

/** The `accept` hint for a file input, derived from the allow-list. */
export const UPLOAD_ACCEPT = Object.values(ALLOWED_MIME_TYPES).flat().join(",");

/** Extensions considered valid for each MIME type. */
const MIME_EXTENSIONS: Record<string, readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/avif": ["avif"],
  "image/gif": ["gif"],
  "video/mp4": ["mp4"],
  "video/webm": ["webm"],
  "video/quicktime": ["mov"],
  "application/pdf": ["pdf"],
};

const MEDIA_TYPE_BY_MIME: Record<string, MediaType> = Object.fromEntries(
  Object.entries(ALLOWED_MIME_TYPES).flatMap(([type, mimes]) =>
    mimes.map((mime) => [mime, type as MediaType]),
  ),
);

export function detectMediaType(mimeType: string): MediaType | null {
  return MEDIA_TYPE_BY_MIME[mimeType] ?? null;
}

function extensionOf(fileName: string): string | null {
  const match = /\.([A-Za-z0-9]+)$/.exec(fileName);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Reduce a display filename to a safe, url-friendly label. Strips directory
 * components, traversal segments and unsafe characters; never returns a path.
 */
export function sanitizeFileName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? "";
  const ext = extensionOf(base);
  const stem = ext ? base.slice(0, -(ext.length + 1)) : base;

  const safeStem = stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const safeExt = (ext ?? "bin").replace(/[^a-z0-9]/g, "");
  return `${safeStem || "file"}.${safeExt}`;
}

export type UploadValidation =
  | { ok: true; type: MediaType; extension: string; safeName: string }
  | { ok: false; error: string };

export type ValidateUploadInput = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

/**
 * Validate an incoming upload. Rejects unsupported content types, extension
 * mismatches, oversized or empty files, and dangerous filenames.
 */
export function validateUpload(input: ValidateUploadInput): UploadValidation {
  const { fileName, mimeType, sizeBytes } = input;

  if (/[\\/]/.test(fileName) || fileName.includes("..")) {
    return {
      ok: false,
      error: "The file name is not valid. Use a plain file name with no path.",
    };
  }

  const type = detectMediaType(mimeType);
  if (!type) {
    return {
      ok: false,
      error: `Unsupported file type "${mimeType || "unknown"}". Allowed: ${Object.values(
        ALLOWED_MIME_TYPES,
      )
        .flat()
        .join(", ")}.`,
    };
  }

  const extensions = MIME_EXTENSIONS[mimeType] ?? [];
  const extension = extensionOf(fileName);

  if (extension && !extensions.includes(extension)) {
    return {
      ok: false,
      error: `The file extension ".${extension}" does not match its content type (${mimeType}).`,
    };
  }

  if (sizeBytes <= 0) {
    return { ok: false, error: "The file is empty." };
  }

  if (sizeBytes > MAX_UPLOAD_BYTES[type]) {
    const limitMb = Math.round(MAX_UPLOAD_BYTES[type] / (1024 * 1024));
    return {
      ok: false,
      error: `The file is too large. Maximum size for ${type}s is ${limitMb} MB.`,
    };
  }

  return {
    ok: true,
    type,
    extension: extension ?? extensions[0],
    safeName: `${sanitizeFileName(fileName).replace(/\.[a-z0-9]+$/, "")}.${
      extension ?? extensions[0]
    }`,
  };
}

export type BuildStoragePathInput = {
  safeName: string;
  id: string;
  createdAt: Date;
  /** Optional grouping folder (e.g. patternCode / categorySlug). */
  scope?: string | null;
};

function sanitizeScope(scope: string | null | undefined): string | null {
  if (!scope) {
    return null;
  }
  const safe = scope
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return safe || null;
}

/**
 * Build the bucket-relative object key for a media object:
 * `[scope/]YYYY-MM/<id>-<safeName>`. The `<id>` guarantees uniqueness even for
 * identical filenames; the year-month folder keeps buckets browsable.
 */
export function buildStoragePath(input: BuildStoragePathInput): string {
  const year = input.createdAt.getUTCFullYear();
  const month = String(input.createdAt.getUTCMonth() + 1).padStart(2, "0");
  const scope = sanitizeScope(input.scope);
  const segments = [
    scope,
    `${year}-${month}`,
    `${input.id}-${input.safeName}`,
  ].filter((segment): segment is string => Boolean(segment));

  return segments.join("/");
}

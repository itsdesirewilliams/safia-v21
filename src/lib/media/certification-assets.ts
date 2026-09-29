import { readdirSync } from "node:fs";
import { join } from "node:path";

import { naturalCompare } from "@/lib/natural-order";

/**
 * Server-only discovery of the developer-provided certification assets. The
 * folders live under `public/` so the files ship with the deployment:
 *  - `public/assets/certifications/logos` — the certification/logo marks;
 *  - `public/assets/certificates` — the ISO certificate PDFs.
 * Adding or removing a file is the only step needed to update the homepage
 * section; nothing is fetched, stored or invented.
 */

const PUBLIC_DIR = join(process.cwd(), "public");

/** Public URL root for the certification logo marks. */
export const CERTIFICATION_LOGOS_ROOT = "/assets/certifications/logos";

/** Public URL root for the ISO certificate PDFs. */
export const CERTIFICATES_ROOT = "/assets/certificates";

/** Image formats accepted for certification logos. */
export const CERTIFICATION_LOGO_EXTENSIONS = [
  ".png",
  ".svg",
  ".webp",
  ".jpg",
  ".jpeg",
  ".avif",
] as const;

/** Document formats accepted for certificates. */
export const CERTIFICATE_EXTENSIONS = [".pdf"] as const;

export type CertificationLogo = {
  filename: string;
  /** Public URL of the logo image. */
  url: string;
  /** Accessible alt text derived from the filename. */
  alt: string;
};

export type Certificate = {
  filename: string;
  /** Public URL of the PDF. */
  url: string;
  /** Display name derived from the filename. */
  name: string;
};

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(dot).toLowerCase() : "";
}

function hasExtension(
  filename: string,
  extensions: readonly string[],
): boolean {
  const extension = extensionOf(filename);
  return extension !== "" && extensions.includes(extension);
}

/** Whether a filename is a supported certification logo image. */
export function isCertificationLogo(filename: string): boolean {
  return hasExtension(filename, CERTIFICATION_LOGO_EXTENSIONS);
}

/** Whether a filename is a supported certificate document. */
export function isCertificate(filename: string): boolean {
  return hasExtension(filename, CERTIFICATE_EXTENSIONS);
}

function stripExtensions(filename: string): string {
  let stem = filename;
  while (extensionOf(stem) !== "") {
    stem = stem.slice(0, -extensionOf(stem).length);
  }
  return stem;
}

/** Humanised label from a filename: separators become spaces. */
export function labelFromFilename(filename: string): string {
  return stripExtensions(filename)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Percent-encode each path segment, preserving the `/` separators. */
function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function listFiles(...segments: string[]): string[] {
  try {
    return readdirSync(join(PUBLIC_DIR, ...segments), { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

/** Map filenames to their public URLs, naturally ordered, dropping unsupported. */
export function discoverCertificationLogos(
  filenames: readonly string[],
): CertificationLogo[] {
  return filenames
    .filter(isCertificationLogo)
    .sort(naturalCompare)
    .map((filename) => ({
      filename,
      url: `${CERTIFICATION_LOGOS_ROOT}/${encodePath(filename)}`,
      alt: labelFromFilename(filename),
    }));
}

/** Map certificate filenames to clickable items, naturally ordered. */
export function discoverCertificates(
  filenames: readonly string[],
): Certificate[] {
  return filenames
    .filter(isCertificate)
    .sort(naturalCompare)
    .map((filename) => ({
      filename,
      url: `${CERTIFICATES_ROOT}/${encodePath(filename)}`,
      name: labelFromFilename(filename),
    }));
}

/** The available certification logos. */
export function readCertificationLogos(): CertificationLogo[] {
  return discoverCertificationLogos(
    listFiles("assets", "certifications", "logos"),
  );
}

/** The available certificates. */
export function readCertificates(): Certificate[] {
  return discoverCertificates(listFiles("assets", "certificates"));
}

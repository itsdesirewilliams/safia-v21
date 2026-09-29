import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { naturalCompare } from "@/lib/natural-order";

/**
 * Read-only inventory of the developer/repository-managed assets under
 * `public/assets` (the canonical repository structure). These files ship with
 * the code and are managed by developers, NOT through Supabase — the File
 * Manager surfaces them for visibility only, with clear labelling and no edit
 * or delete affordances.
 */

const PUBLIC_DIR = join(process.cwd(), "public");

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
};

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".svg",
] as const;

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"] as const;

export type RepositoryAsset = {
  name: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
};

export type RepositoryAssetGroup = {
  id: string;
  label: string;
  description: string;
  files: RepositoryAsset[];
};

type GroupConfig = {
  id: string;
  label: string;
  description: string;
  /** Repo-relative directory under `public`. */
  directory: string;
  /** Public URL root for the served files. */
  urlRoot: string;
  extensions: readonly string[];
};

const GROUPS: readonly GroupConfig[] = [
  {
    id: "business-profile-landscape",
    label: "Business Profile — Landscape",
    description: "16:9 landscape pages of the business profile.",
    directory: "assets/business-profile/landscape",
    urlRoot: "/assets/business-profile/landscape",
    extensions: IMAGE_EXTENSIONS,
  },
  {
    id: "business-profile-portrait",
    label: "Business Profile — Portrait",
    description: "4:5 portrait pages of the business profile.",
    directory: "assets/business-profile/portrait",
    urlRoot: "/assets/business-profile/portrait",
    extensions: IMAGE_EXTENSIONS,
  },
  {
    id: "business-profile-pdf",
    label: "Business Profile PDF",
    description: "The downloadable business-profile document.",
    directory: "assets/business-profile",
    urlRoot: "/assets/business-profile",
    extensions: [".pdf"],
  },
  {
    id: "catalogue-portrait",
    label: "Catalogue — Portrait",
    description: "Catalogue pages (portrait only, used at every size).",
    directory: "assets/catalogue/portrait",
    urlRoot: "/assets/catalogue/portrait",
    extensions: IMAGE_EXTENSIONS,
  },
  {
    id: "catalogue-pdf",
    label: "Catalogue PDF",
    description: "The downloadable catalogue document.",
    directory: "assets/catalogue",
    urlRoot: "/assets/catalogue",
    extensions: [".pdf"],
  },
  {
    id: "team",
    label: "Team",
    description: "Team portraits, matched to members by name slug.",
    directory: "assets/team",
    urlRoot: "/assets/team",
    extensions: IMAGE_EXTENSIONS,
  },
  {
    id: "certifications-logos",
    label: "Certification Logos",
    description: "Certification marks shown on the homepage.",
    directory: "assets/certifications/logos",
    urlRoot: "/assets/certifications/logos",
    extensions: IMAGE_EXTENSIONS,
  },
  {
    id: "certifications-pdfs",
    label: "Certification PDFs",
    description: "ISO certificate documents.",
    directory: "assets/certifications/pdfs",
    urlRoot: "/assets/certifications/pdfs",
    extensions: [".pdf"],
  },
  {
    id: "testing-videos",
    label: "Testing Videos",
    description: "Testing-floor videos for Quality First.",
    directory: "assets/testing/videos",
    urlRoot: "/assets/testing/videos",
    extensions: VIDEO_EXTENSIONS,
  },
  {
    id: "testing-images",
    label: "Testing / Machine Images",
    description: "Machine and testing imagery for Quality First.",
    directory: "assets/testing/images",
    urlRoot: "/assets/testing/images",
    extensions: IMAGE_EXTENSIONS,
  },
];

function mimeForExtension(extension: string): string {
  return MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot).toLowerCase() : "";
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function readGroupFiles(config: GroupConfig): RepositoryAsset[] {
  let names: string[];

  try {
    names = readdirSync(join(PUBLIC_DIR, ...config.directory.split("/")), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
  } catch {
    return [];
  }

  return names
    .filter((name) =>
      config.extensions.includes(extensionOf(name) as (typeof config.extensions)[number]),
    )
    .sort(naturalCompare)
    .map((name) => {
      let sizeBytes = 0;
      try {
        sizeBytes = statSync(
          join(PUBLIC_DIR, ...config.directory.split("/"), name),
        ).size;
      } catch {
        sizeBytes = 0;
      }

      return {
        name,
        url: `${config.urlRoot}/${encodePath(name)}`,
        sizeBytes,
        mimeType: mimeForExtension(extensionOf(name)),
      };
    });
}

/** Every repository asset group, with its supplied files. */
export function readRepositoryAssets(): RepositoryAssetGroup[] {
  return GROUPS.map((config) => ({
    id: config.id,
    label: config.label,
    description: config.description,
    files: readGroupFiles(config),
  }));
}

/** Total number of repository-managed files. */
export function countRepositoryAssets(): number {
  return readRepositoryAssets().reduce(
    (total, group) => total + group.files.length,
    0,
  );
}

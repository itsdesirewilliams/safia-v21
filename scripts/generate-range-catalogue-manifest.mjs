import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Generate `src/lib/media/range-catalogue-pages.json` — the ordered list of
 * TBR/PCR catalogue page URLs — from the supplied artwork under
 * `public/assets/catalogue/<range>/`.
 *
 * This runs before `next build` (npm `prebuild`). Doing the discovery at build
 * time (instead of reading the filesystem at request time) keeps the large
 * artwork out of the server bundle: a runtime `readdirSync` of `public/` makes
 * Next trace the whole `public/` folder into every page function, which blows
 * past Vercel's function-size limit.
 *
 * The artwork files themselves are never modified; re-run this (or just build)
 * after adding or removing a page.
 */

const ROOT = process.cwd();
const RANGES = ["tbr", "pcr"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"];

// Same natural ordering as src/lib/natural-order.ts (2 before 10).
const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

function isImage(name) {
  const lower = name.toLowerCase();
  return IMAGE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

function pagesFor(range) {
  const baseDir = join(ROOT, "public", "assets", "catalogue", range);
  const landscapeDir = join(baseDir, "landscape");
  const useLandscape = existsSync(landscapeDir);
  const dir = useLandscape ? landscapeDir : baseDir;
  const urlRoot = useLandscape
    ? `/assets/catalogue/${range}/landscape`
    : `/assets/catalogue/${range}`;

  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && isImage(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => collator.compare(a, b))
      .map((name) => `${urlRoot}/${encodeURIComponent(name)}`);
  } catch {
    return [];
  }
}

const manifest = Object.fromEntries(
  RANGES.map((range) => [range, pagesFor(range)]),
);

const outFile = join(
  ROOT,
  "src",
  "lib",
  "media",
  "range-catalogue-pages.json",
);
writeFileSync(outFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(
  `[range-catalogue] ${RANGES.map((range) => `${range}:${manifest[range].length}`).join(", ")}`,
);

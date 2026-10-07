// @ts-check
/**
 * Deterministic importer for the Safeway TBR and PCR radial ranges.
 *
 * Reads the source-faithful extraction of the Firemax/Kpatos order sheets
 * (a Markdown dump of the workbook rows) and emits normalized JSON datasets
 * under `src/lib/catalogue/data/`. The generated JSON is committed, so the app
 * never depends on this script at build or runtime; the script exists so the
 * import is repeatable and auditable.
 *
 * Usage:
 *   node scripts/import-range-data.mjs [path-to-source.md]
 *
 * Nothing is inferred: missing source cells become `null`, and the only derived
 * values are the agreed category-level `application` (Truck & Bus / Passenger
 * Car) and the Pattern slug.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

const DEFAULT_SOURCE =
  "C:/Users/Desire C Williams/Downloads/Safeway_Tyre_PCR_TBR_COMPLETE_VARIANT_DATA.md";
const sourcePath = process.argv[2] ?? DEFAULT_SOURCE;

const RANGE_APPLICATION = { tbr: "Truck & Bus", pcr: "Passenger Car" };

function slugify(value) {
  return value
    .toLowerCase()
    // A trailing "+" (e.g. FM19+, FM601+) must not collide with the plain
    // code (FM19, FM601), so it becomes a distinct "-plus" suffix.
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Split a Markdown table row into trimmed cells. */
function cells(line) {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isSeparatorRow(row) {
  return row.length > 0 && row.every((cell) => /^:?-{2,}:?$/.test(cell));
}

function parseNumber(value) {
  if (value === undefined || value === null) return null;
  const raw = value.replace(/,/g, "").trim();
  if (raw === "" || raw === "—" || raw === "-") return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function text(value) {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed === "" || trimmed === "—" ? null : trimmed;
}

/** Map a header cell to a stable field key, or null when it is not tracked. */
function fieldFor(header) {
  const h = header.toLowerCase();
  if (h.includes("source brand")) return "sourceBrand";
  if (h === "brand") return "brand";
  if (h.includes("source code")) return "sourceCode";
  if (h.includes("kpatos")) return "kpatos";
  if (h.includes("firemax")) return "firemax";
  if (h.includes("safecess")) return "safecess";
  if (h.includes("source pattern")) return "sourcePattern";
  if (h.includes("load range")) return "loadRange";
  if (h === "size") return "size";
  if (h.includes("li/sr") || h.includes("l.i.&s.r.")) return "liSr";
  if (h.includes("tread depth")) return "treadDepthMm";
  if (h.includes("fob")) return "fobUsd";
  if (h.includes("40hq qty")) return "cc";
  if (h.includes("order q")) return "orderQty";
  if (h.includes("container volume") || h.includes("ctnr vol")) {
    return "containerVolume";
  }
  if (h.includes("total amount")) return "totalAmountUsd";
  if (h.includes("filler size")) return "fillerSize";
  return null;
}

const NUMERIC = new Set([
  "treadDepthMm",
  "fobUsd",
  "cc",
  "orderQty",
  "containerVolume",
  "totalAmountUsd",
]);

function parseSource(raw) {
  const lines = raw.split(/\r?\n/);

  // Join Markdown table rows that wrap across lines (e.g. a cell containing a
  // line break) so each logical row is a single string.
  const logical = [];
  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i];
    if (line.trimStart().startsWith("|") && !line.trimEnd().endsWith("|")) {
      while (
        i + 1 < lines.length &&
        !lines[i].trimEnd().endsWith("|")
      ) {
        i += 1;
        // The wrap is mid-cell (a cell containing a newline), so join directly.
        line += lines[i].trim();
      }
    }
    logical.push(line);
  }

  const ranges = {
    tbr: { range: "tbr", application: RANGE_APPLICATION.tbr, patterns: [] },
    pcr: { range: "pcr", application: RANGE_APPLICATION.pcr, patterns: [] },
  };

  let currentRange = null;
  let currentPattern = null;
  let headerMap = null;
  const supplementary = { sheets: [], rows: 0 };

  for (const rawLine of logical) {
    const line = rawLine.trim();

    if (line.startsWith("# ")) {
      if (line.startsWith("# 1.")) currentRange = "tbr";
      else if (line.startsWith("# 2.")) currentRange = "pcr";
      else if (line.startsWith("# 3.")) currentRange = "supplementary";
      else if (line.startsWith("# 4.")) currentRange = null;
      currentPattern = null;
      headerMap = null;
      continue;
    }

    if (line.startsWith("## ")) {
      if (currentRange === "supplementary") {
        supplementary.sheets.push(line.replace(/^##\s+/, "").trim());
      }
      currentPattern = null;
      headerMap = null;
      continue;
    }

    if (line.startsWith("### ")) {
      currentPattern = line.replace(/^###\s+/, "").trim();
      headerMap = null;
      if (currentRange === "tbr" || currentRange === "pcr") {
        ranges[currentRange].patterns.push({
          patternCode: currentPattern,
          slug: slugify(currentPattern),
          variants: [],
        });
      }
      continue;
    }

    if (!line.startsWith("|")) {
      continue;
    }

    const row = cells(line);

    if (currentRange === "supplementary") {
      if (!isSeparatorRow(row)) supplementary.rows += 1;
      continue;
    }

    if (currentRange !== "tbr" && currentRange !== "pcr") {
      continue;
    }

    // A header row declares the column order for the following rows.
    const lower = row.map((cell) => cell.toLowerCase());
    if (lower.includes("size") && lower.some((cell) => cell.includes("brand"))) {
      headerMap = row.map(fieldFor);
      continue;
    }

    if (!headerMap || !currentPattern || isSeparatorRow(row)) {
      continue;
    }

    const variant = {};
    for (let i = 0; i < headerMap.length; i += 1) {
      const field = headerMap[i];
      if (!field) continue;
      const value = row[i];
      variant[field] = NUMERIC.has(field) ? parseNumber(value) : text(value);
    }

    const pattern = ranges[currentRange].patterns.at(-1);
    if (!pattern || pattern.patternCode !== currentPattern) continue;

    const internal = {};
    for (const key of [
      "brand",
      "sourceBrand",
      "sourceCode",
      "kpatos",
      "firemax",
      "safecess",
      "sourcePattern",
      "loadRange",
      "treadDepthMm",
      "fobUsd",
      "orderQty",
      "containerVolume",
      "totalAmountUsd",
      "fillerSize",
    ]) {
      if (key in variant) internal[key] = variant[key];
    }

    pattern.variants.push({
      size: variant.size ?? "",
      application: ranges[currentRange].application,
      liSr: variant.liSr ?? null,
      cc: variant.cc ?? null,
      internal,
    });
  }

  return { ranges, supplementary };
}

const raw = readFileSync(sourcePath, "utf8");
const { ranges, supplementary } = parseSource(raw);

const outDir = resolve(repoRoot, "src/lib/catalogue/data");
mkdirSync(outDir, { recursive: true });

for (const range of ["tbr", "pcr"]) {
  const dataset = ranges[range];
  writeFileSync(
    resolve(outDir, `${range}.json`),
    JSON.stringify(dataset, null, 2) + "\n",
    "utf8",
  );
}

function summarise(range) {
  const dataset = ranges[range];
  const variantCount = dataset.patterns.reduce(
    (sum, pattern) => sum + pattern.variants.length,
    0,
  );
  console.log(
    `${range.toUpperCase()}: ${dataset.patterns.length} patterns, ${variantCount} variants`,
  );
}

summarise("tbr");
summarise("pcr");
console.log(
  `Supplementary sheets: ${supplementary.sheets.join(", ")} (${supplementary.rows} rows, not merged)`,
);

/**
 * Contract for the Admin Pattern Image bulk uploader.
 *
 * The filename is a *user-provided alias*: its stem is extension-stripped,
 * trimmed and case-folded, then reduced to a normalized lookup key so common
 * formatting variations resolve to the same Pattern Code — separators (`-`, `_`
 * and spaces) are equivalent, and a trailing `+` may be written `PLUS`
 * (`fm-06.webp` → `FM06`, `fm-601-plus.webp` → `FM601+`). The candidate is then
 * compared against the normalized canonical Pattern Codes derived from the
 * whole catalogue; the catalogue stays the source of truth and this module only
 * proposes, the caller disposes. It never manufactures a code that is not in the
 * catalogue, and a candidate that matches more than one canonical code is
 * reported as ambiguous rather than guessed.
 */

/** The dedicated bucket that holds Pattern-level imagery. */
export const PATTERN_IMAGE_BUCKET_ID = "product-images" as const;

/** How many files may be uploaded in one batch. */
export const PATTERN_IMAGE_BATCH_MAX = 100;

/** The `accept` hint for the Pattern Image bulk input. */
export const PATTERN_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif" as const;

/** The folder prefix under which Pattern images are stored. */
export const PATTERN_IMAGE_PATH_ROOT = "patterns";

/** A Pattern entry the uploader can resolve a filename against. */
export type PatternImageDirectoryEntry = {
  /** The canonical Pattern Code as stored in the catalogue. */
  patternCode: string;
  displayName: string;
  categorySlug: string;
  categoryName: string;
  /** The product range label: `Nylon`, `TBR`, `PCR`, or the category name. */
  range: string;
};

export type PatternCodeLookup =
  | { status: "matched"; entry: PatternImageDirectoryEntry }
  | { status: "not-found" }
  | { status: "ambiguous"; matches: PatternImageDirectoryEntry[] };

/** Canonical comparison form for a Pattern Code: trimmed, upper-cased. */
export function normalizePatternCode(value: string): string {
  return value.trim().toUpperCase();
}

/**
 * The normalized key a Pattern Code (or a filename alias) is matched on.
 *
 * It upper-cases, folds a trailing `+` / `PLUS` / `-PLUS` / `_PLUS` / ` PLUS`
 * alias to `+`, then removes the separator characters (`-`, `_`, spaces) so
 * `FM06`, `FM-06`, `FM 06` and `fm_06` all share one key. This is applied to
 * both the uploaded filename and the canonical catalogue codes, so the two are
 * compared on equal footing. It deliberately does NOT drop other characters, so
 * it cannot merge unrelated codes; the catalogue lookup still decides validity.
 */
export function patternLookupKey(value: string): string {
  const upper = value.trim().toUpperCase();
  const withPlus = upper.replace(/(?:[-_\s]*PLUS|\+)$/, "+");
  return withPlus.replace(/[-_\s]+/g, "");
}

const EXTENSION = /\.([A-Za-z0-9]+)$/;

/**
 * The Pattern Code a filename claims: the final path segment with one
 * extension removed, then trimmed and upper-cased. `null` when nothing
 * remains.
 */
export function patternCodeFromFileName(fileName: string): string | null {
  const base = (fileName.split(/[\\/]/).pop() ?? "").trim();
  const stem = base.replace(EXTENSION, "");
  const code = normalizePatternCode(stem);
  return code === "" ? null : code;
}

/** Resolve a Pattern Code against the directory: exactly one match wins. */
export function lookupPatternCode(
  code: string,
  directory: readonly PatternImageDirectoryEntry[],
): PatternCodeLookup {
  const key = patternLookupKey(code);
  if (key === "") {
    return { status: "not-found" };
  }
  const matches = directory.filter(
    (entry) => patternLookupKey(entry.patternCode) === key,
  );

  if (matches.length === 0) {
    return { status: "not-found" };
  }
  if (matches.length > 1) {
    return { status: "ambiguous", matches };
  }
  return { status: "matched", entry: matches[0] };
}

/** Turn one distinct filename into its upload plan. */
export type PatternImagePlan = {
  fileName: string;
  /**
   * The canonical Pattern Code once the filename resolves (e.g. `fm-06.webp` →
   * `FM06`), the raw candidate when it does not, or `null` when the filename has
   * no stem. The canonical catalogue code is always the stored identifier.
   */
  code: string | null;
  entry: PatternImageDirectoryEntry | null;
  /**
   * `ready` to upload, `exists` when an image already exists (offer Replace),
   * `failed` when the file cannot be associated.
   */
  status: "ready" | "exists" | "failed";
  reason?: string;
};

/**
 * Plan a batch of filenames in order. Within one batch a Pattern Code may only
 * appear once: a second file resolving to the same code is a conflict and
 * fails, so a bulk upload can never silently clobber its own pattern.
 */
export function planPatternImageFiles(
  fileNames: readonly string[],
  directory: readonly PatternImageDirectoryEntry[],
  existingCodes: ReadonlySet<string>,
): PatternImagePlan[] {
  const seen = new Set<string>();

  return fileNames.map((fileName) => {
    const candidate = patternCodeFromFileName(fileName);

    if (!candidate) {
      return {
        fileName,
        code: null,
        entry: null,
        status: "failed",
        reason: "Could not read a Pattern Code from the filename.",
      };
    }

    const lookup = lookupPatternCode(candidate, directory);

    if (lookup.status === "not-found") {
      return {
        fileName,
        code: candidate,
        entry: null,
        status: "failed",
        reason: "Pattern Code not found",
      };
    }

    if (lookup.status === "ambiguous") {
      const options = lookup.matches.map((match) => match.patternCode).join(", ");
      return {
        fileName,
        code: candidate,
        entry: null,
        status: "failed",
        reason: `Ambiguous Pattern Code — matches ${options}.`,
      };
    }

    // The canonical catalogue code is always the stored identifier.
    const code = lookup.entry.patternCode;

    if (seen.has(code)) {
      return {
        fileName,
        code,
        entry: lookup.entry,
        status: "failed",
        reason: `Another file in this batch already resolves to ${code}.`,
      };
    }

    seen.add(code);

    if (existingCodes.has(code)) {
      return {
        fileName,
        code,
        entry: lookup.entry,
        status: "exists",
        reason: "Image already exists",
      };
    }

    return {
      fileName,
      code,
      entry: lookup.entry,
      status: "ready",
    };
  });
}

/**
 * A safe, data-driven object key for a Pattern image:
 * `patterns/<code>/<id>-<safe-name>`. The lower-cased code folder keeps the
 * bucket browsable; the id guarantees uniqueness so Replace never collides.
 */
export function buildPatternImagePath(
  code: string,
  id: string,
  safeName: string,
): string {
  const scope =
    normalizePatternCode(code)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "unknown";

  return `${PATTERN_IMAGE_PATH_ROOT}/${scope}/${id}-${safeName}`;
}

/** Whether a path is a canonical Pattern-image object key. */
export function isSafePatternImagePath(path: string): boolean {
  return /^patterns\/[a-z0-9-]+\/[A-Za-z0-9._-]+$/.test(path);
}

/** A single object the browser has already uploaded, awaiting its record. */
export type PatternImageBatchEntry = {
  name: string;
  path: string;
  mimeType: string;
  sizeBytes: number;
  /** Whether the Admin deliberately chose to replace an existing image. */
  replace: boolean;
};

export type PatternImageBatchFailure = {
  name: string;
  error: string;
};

export type PatternImageBatchResult = {
  created: number;
  replaced: number;
  failures: PatternImageBatchFailure[];
};

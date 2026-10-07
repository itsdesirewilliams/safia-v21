/**
 * Tyre-size normalization (Phase 1).
 *
 * Customers omit decimals, hyphens, spaces and use inconsistent punctuation, so
 * a raw numeric phrase can rarely be trusted as a size. This module turns a
 * numeric phrase into *candidate* canonical sizes — never a guaranteed size —
 * and the caller confirms each candidate against the real catalogue via a
 * `SizeDictionary` (lower-cased size → exact stored size).
 *
 * Every rule here is explicit and deterministic. Nothing is inferred from a
 * number merely because a transformation "looks plausible": a candidate that
 * the dataset does not contain is simply dropped.
 */

import { normalizeTyreSize } from "./tyre-size";

/** lower-cased canonical size → the exact size as stored in the dataset. */
export type SizeDictionary = ReadonlyMap<string, string>;

/**
 * A token made only of size-building characters: digits, size separators and
 * the construction/type letters that appear inside real sizes (r/zr, l, x).
 */
const NUMERIC_TOKEN = /^(?=.*\d)[0-9.\-/xzrl]+$/;
const ATOM = /^\d{1,4}(?:\.\d+)?$/;
const ATOM_GLOBAL = /\d+(?:\.\d+)?/g;
const BARE_INTEGER = /^\d{5,6}$/;

/** Confirm one candidate against the dataset, returning its canonical spelling. */
function confirm(
  candidate: string,
  sizes: SizeDictionary,
): string | null {
  return sizes.get(candidate.toLowerCase()) ?? null;
}

/**
 * Plausible canonical spellings for a width atom. A width such as `7.50` may
 * arrive as `750` (decimal point dropped) or `7.50`; a 4-digit width such as
 * `10.00` may arrive as `1000`. The raw atom is always kept too, so integer
 * widths that really are integers (`250`, `300`, `10`) still work.
 */
export function widthVariants(atom: string): string[] {
  const variants = [atom];
  if (/^\d+$/.test(atom) && atom.length >= 3) {
    const scaled = (Number(atom) / 100).toFixed(2);
    if (!variants.includes(scaled)) {
      variants.push(scaled);
    }
  }
  return variants;
}

function isAtom(value: string): boolean {
  return ATOM.test(value);
}

function collectPair(
  a: string,
  b: string,
  sizes: SizeDictionary,
  out: Set<string>,
): void {
  if (!isAtom(a) || !isAtom(b)) {
    return;
  }
  // Forward: a is the section width, b the rim diameter.
  for (const width of widthVariants(a)) {
    const size = confirm(`${width}-${b}`, sizes);
    if (size) {
      out.add(size);
    }
  }
  // Reversed dimensions ("25-23.5" for "23.5-25"): only kept if it confirms.
  for (const width of widthVariants(b)) {
    const size = confirm(`${width}-${a}`, sizes);
    if (size) {
      out.add(size);
    }
  }
}

function collectTriple(
  a: string,
  b: string,
  c: string,
  sizes: SizeDictionary,
  out: Set<string>,
): void {
  if (!isAtom(a) || !isAtom(b) || !isAtom(c)) {
    return;
  }
  // "7 50 16" / "10 00 16": the first two atoms are one width with the decimal
  // point dropped.
  for (const width of widthVariants(`${a}${b}`)) {
    const size = confirm(`${width}-${c}`, sizes);
    if (size) {
      out.add(size);
    }
  }
  // Metric sizes written with spaces: "110 90 13" → "110/90-13".
  const metric = confirm(`${a}/${b}-${c}`, sizes);
  if (metric) {
    out.add(metric);
  }
}

/** A single token: a known size, a hyphenated pair, or a bare long integer. */
function collectToken(
  token: string,
  sizes: SizeDictionary,
  out: Set<string>,
): void {
  const direct = confirm(token, sizes);
  if (direct) {
    out.add(direct);
  }

  const parts = token.split("-");
  if (parts.length === 2 && isAtom(parts[0]) && isAtom(parts[1])) {
    collectPair(parts[0], parts[1], sizes, out);
    return;
  }

  if (BARE_INTEGER.test(token)) {
    // "75016" → 750 + 16; "100016" → 1000 + 16 (or 100 + 016).
    const splits = token.length === 5 ? [3] : [4, 3];
    for (const split of splits) {
      collectPair(token.slice(0, split), token.slice(split), sizes, out);
    }
  }
}

function collectRun(
  run: readonly string[],
  sizes: SizeDictionary,
  out: Set<string>,
): void {
  // Canonical normalization first: the same rules the range search and the
  // dictionary keys use, so "295/80 R22.5" and "6.50/16" resolve here too.
  const canonical = normalizeTyreSize(run.join(" "));
  if (canonical) {
    const confirmed = confirm(canonical, sizes);
    if (confirmed) {
      out.add(confirmed);
    }
  }

  if (run.length === 1) {
    collectToken(run[0], sizes, out);
  } else if (run.length === 2) {
    collectPair(run[0], run[1], sizes, out);
  } else if (run.length === 3) {
    collectTriple(run[0], run[1], run[2], sizes, out);
  }
}

/** Whether a run of numeric tokens is even attempting to describe a size. */
function isSizeLikeRun(run: readonly string[]): boolean {
  if (run.some((token) => BARE_INTEGER.test(token))) {
    return true;
  }
  const atoms = run.reduce(
    (total, token) => total + (token.match(ATOM_GLOBAL)?.length ?? 0),
    0,
  );
  return atoms >= 2;
}

export type SizeExtraction = {
  /** Confirmed canonical sizes, in the order they were generated. */
  candidates: string[];
  /** True when the text contained something size-shaped that did not confirm. */
  hadSizeLikeInput: boolean;
};

/**
 * Extract confirmed size candidates from cleaned text. Numeric tokens are
 * grouped into runs (so "750 16" is read as a pair) and each run is expanded
 * into candidates, which are then confirmed against the dataset.
 */
export function extractSizeCandidates(
  text: string,
  sizes: SizeDictionary,
): SizeExtraction {
  const out = new Set<string>();
  let hadSizeLikeInput = false;

  const tokens = text.split(" ").filter(Boolean);
  let run: string[] = [];

  const flush = () => {
    if (run.length === 0) {
      return;
    }
    hadSizeLikeInput = hadSizeLikeInput || isSizeLikeRun(run);
    collectRun(run, sizes, out);
    run = [];
  };

  for (const token of tokens) {
    if (NUMERIC_TOKEN.test(token)) {
      run.push(token);
    } else {
      flush();
    }
  }
  flush();

  return { candidates: [...out], hadSizeLikeInput };
}

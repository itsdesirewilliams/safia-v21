/**
 * Canonical tyre-size normalization — the single source of truth.
 *
 * Both the user's query and every searchable catalogue value run through
 * `normalizeTyreSize`, so equivalent human spellings collapse to one canonical
 * key and distinct sizes stay distinct. It is deliberately structural: it
 * understands width / aspect ratio / construction / rim diameter rather than
 * blindly stripping punctuation, which would merge unrelated sizes.
 *
 * The canonical key is an internal spelling (e.g. `295/80R22.5`, `6.5-16`,
 * `11L-15`). It is never shown to customers; it exists so the same rules apply
 * to the query, the bundled radial ranges and the database lookup alike.
 *
 * A returned key is a *candidate*: the search still confirms it against real
 * catalogue values, so a structurally-plausible but non-existent size simply
 * finds nothing (false positives are worse than no result).
 */

const WIDTH = String.raw`(\d{1,3}(?:\.\d{1,2})?)`;
const ASPECT = String.raw`(\d{2})`;
const RIM = String.raw`(\d{1,3}(?:\.\d{1,2})?)`;
const SEP = String.raw`[\/-]`;
const OPT_SEP = String.raw`[\/-]?`;
const CONSTR = String.raw`(?:zr|r)`;

// Order matters: the most specific structures are tried first.
const METRIC_ASPECT = new RegExp(`^${WIDTH}${OPT_SEP}${ASPECT}${CONSTR}${RIM}`);
const METRIC_NO_ASPECT = new RegExp(`^${WIDTH}${CONSTR}${RIM}`);
const METRIC_ASPECT_PLAIN = new RegExp(`^${WIDTH}${SEP}${ASPECT}${OPT_SEP}${RIM}$`);
// "295 80 22.5" / "29580225" / "2056515" — metric with the separators dropped.
const METRIC_COMPACT = new RegExp(
  String.raw`^(\d{3})(\d{2})(\d{2}\.\d+|\d{3}|\d{2})$`,
);
const LETTER = new RegExp(`^${WIDTH}(l|x)${OPT_SEP}${RIM}$`);
// A bias size written compactly but with its decimal width intact ("12.424" →
// 12.4-24, "6.5016" → 6.50-16). The rim is 2–3 digits so the split is
// unambiguous; a decimal-less compact form ("75016") stays dictionary-confirmed.
const BIAS_COMPACT_DECIMAL = new RegExp(
  String.raw`^(\d{1,3}\.\d{1,2})(\d{2,3})$`,
);
const BIAS = new RegExp(`^${WIDTH}${OPT_SEP}${RIM}$`);

/** Strip insignificant trailing zeros/decimal point ("7.50" → "7.5", "22.0" → "22"). */
function trimDecimal(value: string): string {
  if (!value.includes(".")) {
    return value;
  }
  return value.replace(/0+$/, "").replace(/\.$/, "");
}

function normalizeWidth(width: string, metric: boolean): string | null {
  let value: string;
  if (width.includes(".")) {
    value = trimDecimal(width);
  } else if (metric) {
    value = width;
  } else if (width.length >= 3) {
    // "750" → "7.5", "1000" → "10" (a bias width written without its decimal).
    value = trimDecimal((Number(width) / 100).toFixed(2));
  } else {
    value = width;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 1 || numeric > 400) {
    return null;
  }
  return value;
}

function normalizeRim(rim: string): string | null {
  let value: string;
  if (rim.includes(".")) {
    value = trimDecimal(rim);
  } else if (rim.length === 3) {
    // "225" → "22.5" (rim written without its decimal point).
    value = trimDecimal(`${rim.slice(0, 2)}.${rim.slice(2)}`);
  } else {
    value = rim;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 4 || numeric > 44) {
    return null;
  }
  return value;
}

function isPlausibleAspect(aspect: string): boolean {
  const numeric = Number(aspect);
  return Number.isFinite(numeric) && numeric >= 20 && numeric <= 100;
}

function canonicalMetric(
  width: string,
  aspect: string | null,
  rim: string,
): string | null {
  const w = normalizeWidth(width, true);
  const r = normalizeRim(rim);
  if (!w || !r) {
    return null;
  }
  if (aspect) {
    if (!isPlausibleAspect(aspect)) {
      return null;
    }
    return `${w}/${aspect}R${r}`;
  }
  return `${w}R${r}`;
}

function canonicalBias(width: string, rim: string): string | null {
  const w = normalizeWidth(width, false);
  const r = normalizeRim(rim);
  if (!w || !r) {
    return null;
  }
  return `${w}-${r}`;
}

/**
 * Normalize a single size expression to its canonical key, or `null` when the
 * text cannot be confidently read as a tyre size. Spaces, unicode dashes and
 * letter case are all tolerated.
 */
export function normalizeTyreSize(input: string): string | null {
  if (!input) {
    return null;
  }

  const compact = input
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\s+/g, "");

  if (compact.length === 0) {
    return null;
  }

  let match = METRIC_ASPECT.exec(compact);
  if (match) {
    return canonicalMetric(match[1], match[2], match[3]);
  }

  match = METRIC_NO_ASPECT.exec(compact);
  if (match) {
    return canonicalMetric(match[1], null, match[2]);
  }

  match = METRIC_ASPECT_PLAIN.exec(compact);
  if (match) {
    return canonicalMetric(match[1], match[2], match[3]);
  }

  match = METRIC_COMPACT.exec(compact);
  if (match) {
    return canonicalMetric(match[1], match[2], match[3]);
  }

  match = LETTER.exec(compact);
  if (match) {
    const w = normalizeWidth(match[1], false);
    const r = normalizeRim(match[3]);
    if (w && r) {
      return `${w}${match[2].toUpperCase()}-${r}`;
    }
    return null;
  }

  match = BIAS_COMPACT_DECIMAL.exec(compact);
  if (match) {
    return canonicalBias(match[1], match[2]);
  }

  match = BIAS.exec(compact);
  if (match) {
    const separator = compact.slice(match[1].length, compact.length - match[2].length);
    const width = match[1];
    // A compact bias form with no separator ("75016") is ambiguous between
    // "750-16" and "7.50-16", so it is left to the dictionary-confirmed path.
    if (separator.length === 0 && !width.includes(".")) {
      return null;
    }
    return canonicalBias(width, match[2]);
  }

  return null;
}

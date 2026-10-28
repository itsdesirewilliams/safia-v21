import { decodeEntities, stripHtml } from "./html";

/**
 * Parse a pasted table from Excel, Google Sheets, Word, a web page or a
 * tab-separated text selection.
 *
 * The parser is intentionally dependency-free and DOM-free so it can run in
 * the client and be unit-tested in Node. Merged cells are flattened to one
 * value per cell; rows are padded to the widest row.
 */
export function parsePastedTable(input: {
  html?: string | null;
  text?: string | null;
}): string[][] | null {
  const fromHtml = parseHtmlTable(input.html ?? "");
  if (fromHtml) {
    return fromHtml;
  }
  return parseTabSeparated(input.text ?? "");
}

function cellText(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/(?:p|div|li)>/gi, " ")
      .replace(/<[^>]*>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function parseHtmlTable(html: string): string[][] | null {
  if (!/<table[\s>]/i.test(html)) {
    return null;
  }

  const rows: string[][] = [];
  const rowMatches = html.match(/<tr[\s>][\s\S]*?<\/tr>/gi) ?? [];
  for (const row of rowMatches) {
    const cells = row.match(/<t[hd][\s>][\s\S]*?<\/t[hd]>/gi) ?? [];
    if (cells.length === 0) {
      continue;
    }
    rows.push(cells.map((cell) => cellText(cell)));
  }

  if (rows.length === 0) {
    return null;
  }

  return normaliseRows(rows);
}

function parseTabSeparated(text: string): string[][] | null {
  if (!text.includes("\t")) {
    return null;
  }

  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  if (lines.length < 2) {
    return null;
  }

  const rows = lines
    .map((line) => line.split("\t").map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell !== ""));

  if (rows.length === 0 || Math.max(...rows.map((row) => row.length)) < 2) {
    return null;
  }

  return normaliseRows(rows);
}

function normaliseRows(rows: string[][]): string[][] {
  const width = Math.max(...rows.map((row) => row.length));
  return rows.map((row) => {
    const padded = [...row];
    while (padded.length < width) {
      padded.push("");
    }
    return padded;
  });
}

/** Convert a pasted table to plain text (used in tests and diagnostics). */
export function tableToPlainText(rows: readonly (readonly string[])[]): string {
  return rows.map((row) => row.map((cell) => stripHtml(cell)).join("\t")).join("\n");
}

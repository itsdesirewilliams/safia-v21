import {
  decodeEntities,
  escapeAttribute,
  escapeHtml,
} from "./html";

/**
 * Rich-text sanitizer for Post bodies.
 *
 * Stored HTML is untrusted (it can arrive from a paste or a direct API call),
 * so only a small allow-list survives:
 *   p, br, strong, b, em, i, u, a[href]
 * All other tags are removed while their text content is kept. Links get
 * `rel="noopener noreferrer"` and external http(s) links open in a new tab.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "a",
]);

const VOID_TAGS = new Set(["br"]);

/** Normalise and validate a link target. Returns null when unsafe. */
export function normalizeLinkHref(raw: string): string | null {
  const value = decodeEntities(raw).trim();
  if (!value) {
    return null;
  }

  // Never allow control characters or whitespace inside a URL.
  if (/[\u0000-\u001f\u007f\s]/.test(value)) {
    return null;
  }

  if (value.startsWith("/") || value.startsWith("#")) {
    return value;
  }

  if (/^(mailto|tel):/i.test(value)) {
    return value;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return /^https?:/i.test(value) ? value : null;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  return `https://${value}`;
}

/** Validate and normalise an image source (http(s) or site-relative). */
export function normalizeImageSrc(raw: string): string | null {
  const value = decodeEntities(raw).trim();
  if (!value) {
    return null;
  }
  if (/[\u0000-\u001f\u007f\s]/.test(value)) {
    return null;
  }
  if (value.startsWith("/")) {
    return value;
  }
  return /^https?:\/\//i.test(value) ? value : null;
}

function extractHref(attributes: string): string | null {
  const match = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attributes);
  if (!match) {
    return null;
  }
  return normalizeLinkHref(match[1] ?? match[2] ?? match[3] ?? "");
}

/**
 * Sanitize a rich-text fragment. Returns clean, balanced HTML containing only
 * allow-listed tags. The function is deliberately conservative and never
 * emits attributes other than a safe `href`, `target` and `rel`.
 */
export function sanitizeRichText(input: unknown): string {
  if (typeof input !== "string" || input.length === 0) {
    return "";
  }

  const tokens = input.match(/<[^>]*>|[^<]+/g) ?? [];
  const stack: string[] = [];
  let output = "";

  const closeTo = (index: number) => {
    while (stack.length > index) {
      output += `</${stack.pop()}>`;
    }
  };

  for (const token of tokens) {
    if (!token.startsWith("<")) {
      output += escapeHtml(decodeEntities(token));
      continue;
    }

    const parsed = /^<\s*(\/?)\s*([a-zA-Z0-9]+)([^>]*)>$/.exec(token);
    if (!parsed) {
      // Comments, malformed tags and stray markup are dropped.
      continue;
    }

    const closing = parsed[1] === "/";
    const tag = parsed[2].toLowerCase();
    const attributes = parsed[3] ?? "";

    if (!ALLOWED_TAGS.has(tag)) {
      continue;
    }

    if (tag === "br") {
      if (!closing) {
        output += "<br>";
      }
      continue;
    }

    if (closing) {
      const index = stack.lastIndexOf(tag);
      if (index !== -1) {
        closeTo(index);
      }
      continue;
    }

    if (tag === "a") {
      const href = extractHref(attributes);
      if (!href) {
        // Unsafe link: keep the text, drop the anchor.
        continue;
      }
      // Nested anchors are invalid; close the previous one first.
      if (stack.includes("a")) {
        closeTo(stack.lastIndexOf("a"));
      }
      const external = /^https?:\/\//i.test(href);
      output += `<a href="${escapeAttribute(href)}"${
        external ? ' target="_blank" rel="noopener noreferrer"' : ' rel="noopener noreferrer"'
      }>`;
      stack.push("a");
      continue;
    }

    output += `<${tag}>`;
    stack.push(tag);
  }

  while (stack.length > 0) {
    output += `</${stack.pop()}>`;
  }

  return output;
}

/** Whether a rich-text value contains visible text (not just empty tags). */
export function hasVisibleText(html: string): boolean {
  return stripVisibleText(html) !== "";
}

function stripVisibleText(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export { VOID_TAGS };

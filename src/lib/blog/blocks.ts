import { plainTextToHtml, sanitizePlainText, stripHtml } from "./html";
import { normalizeImageSrc, sanitizeRichText } from "./sanitize";

/**
 * The Post body block model (spec #2 / ADR-0005, extended for the block editor).
 *
 * A Post body is an ordered list of typed blocks stored as JSON and rendered to
 * semantic HTML at read time. Images reference a Media record by id (or, for
 * legacy/imported content, a URL) so media stays managed through the shared
 * Media layer.
 *
 * Legacy blocks (`paragraph`, `heading`, `image`) remain valid so existing
 * posts keep rendering and saving. New editor content uses `text` for rich
 * text; the editor converts legacy blocks on load.
 */

export const POST_BLOCK_TYPES = [
  "paragraph",
  "text",
  "heading",
  "image",
  "imageText",
  "list",
  "table",
  "faq",
] as const;

export type PostBlockType = (typeof POST_BLOCK_TYPES)[number];

export function isPostBlockType(value: unknown): value is PostBlockType {
  return (
    typeof value === "string" &&
    (POST_BLOCK_TYPES as readonly string[]).includes(value)
  );
}

export const BLOCK_TEXT_MAX_LENGTH = 5000;
export const BLOCK_HTML_MAX_LENGTH = 20000;
export const BLOCK_HEADING_MAX_LENGTH = 300;
export const BLOCK_ALT_MAX_LENGTH = 300;
export const BLOCK_CAPTION_MAX_LENGTH = 500;
export const BLOCK_ITEM_HEADING_MAX_LENGTH = 300;
export const BLOCK_QUESTION_MAX_LENGTH = 300;
export const TABLE_MAX_ROWS = 100;
export const TABLE_MAX_COLUMNS = 20;
export const TABLE_CELL_MAX_LENGTH = 2000;
export const LIST_MAX_ITEMS = 50;
export const FAQ_MAX_ITEMS = 50;
export const MAX_BLOCKS = 200;

export type HeadingLevel = 2 | 3 | 4;

/** Legacy plain-text paragraph. */
export type ParagraphBlock = { type: "paragraph"; text: string };

/** Rich-text paragraph block (sanitized inline HTML). */
export type TextBlock = { type: "text"; html: string };

export type HeadingBlock = {
  type: "heading";
  level: HeadingLevel;
  text: string;
};

export type ImageBlock = {
  type: "image";
  mediaId: string;
  alt: string | null;
  caption: string | null;
  /** Optional URL for imported/legacy content; Media ids are preferred. */
  url?: string | null;
};

export type ImageTextBlock = {
  type: "imageText";
  position: "left" | "right";
  mediaId: string;
  url?: string | null;
  caption: string | null;
  heading: string | null;
  html: string;
};

export type ListExplainItem = { heading: string; html: string };

export type ListExplainBlock = {
  type: "list";
  heading: string;
  items: ListExplainItem[];
};

export type TableBlock = { type: "table"; rows: string[][] };

export type FaqItem = { question: string; html: string };

export type FaqBlock = {
  type: "faq";
  heading: string;
  items: FaqItem[];
};

export type PostBlock =
  | ParagraphBlock
  | TextBlock
  | HeadingBlock
  | ImageBlock
  | ImageTextBlock
  | ListExplainBlock
  | TableBlock
  | FaqBlock;

export type ParseBlocksResult =
  | { ok: true; blocks: PostBlock[] }
  | { ok: false; error: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

/** Trim a possibly-unknown value to a string (empty when absent). */
export function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown, maxLength: number): string | null {
  const text = sanitizePlainText(value, maxLength);
  return text || null;
}

function clampHeadingLevel(value: unknown): HeadingLevel {
  return value === 3 || value === 4 ? value : 2;
}

function parseRows(value: unknown): string[][] {
  if (!Array.isArray(value)) {
    return [];
  }
  const rows: string[][] = [];
  for (const rawRow of value.slice(0, TABLE_MAX_ROWS)) {
    if (!Array.isArray(rawRow)) {
      continue;
    }
    rows.push(
      rawRow
        .slice(0, TABLE_MAX_COLUMNS)
        .map((cell) => sanitizePlainText(cell, TABLE_CELL_MAX_LENGTH)),
    );
  }
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  return rows.map((row) => {
    const padded = [...row];
    while (padded.length < width) {
      padded.push("");
    }
    return padded;
  });
}

function parseImageFields(record: Record<string, unknown>) {
  const mediaId = cleanText(record.mediaId);
  const rawUrl = cleanText(record.url);
  const url = rawUrl ? normalizeImageSrc(rawUrl) : null;
  return {
    mediaId,
    ...(url ? { url } : {}),
    caption: optionalText(record.caption, BLOCK_CAPTION_MAX_LENGTH),
    alt: optionalText(record.alt, BLOCK_ALT_MAX_LENGTH),
  };
}

function parseBlock(
  value: unknown,
): { ok: true; block: PostBlock } | { ok: false; error: string } {
  const record = asRecord(value);
  if (!record || !isPostBlockType(record.type)) {
    return { ok: false, error: "Every body block needs a valid type." };
  }

  switch (record.type) {
    case "paragraph": {
      // Legacy blocks keep their original shape and plain-text rendering.
      const text = cleanText(record.text);
      if (!text) {
        return { ok: false, error: "A paragraph block needs text." };
      }
      if (text.length > BLOCK_TEXT_MAX_LENGTH) {
        return {
          ok: false,
          error: `A paragraph must be ${BLOCK_TEXT_MAX_LENGTH} characters or fewer.`,
        };
      }
      return { ok: true, block: { type: "paragraph", text } };
    }

    case "text": {
      const html = sanitizeRichText(record.html);
      if (html.length > BLOCK_HTML_MAX_LENGTH) {
        return {
          ok: false,
          error: `A text block must be ${BLOCK_HTML_MAX_LENGTH} characters or fewer.`,
        };
      }
      return { ok: true, block: { type: "text", html } };
    }

    case "heading": {
      const text = sanitizePlainText(record.text, BLOCK_HEADING_MAX_LENGTH);
      return {
        ok: true,
        block: { type: "heading", level: clampHeadingLevel(record.level), text },
      };
    }

    case "image": {
      const fields = parseImageFields(record);
      return {
        ok: true,
        block: {
          type: "image",
          mediaId: fields.mediaId,
          alt: fields.alt,
          caption: fields.caption,
          ...(fields.url ? { url: fields.url } : {}),
        },
      };
    }

    case "imageText": {
      const fields = parseImageFields(record);
      return {
        ok: true,
        block: {
          type: "imageText",
          position: record.position === "right" ? "right" : "left",
          mediaId: fields.mediaId,
          ...(fields.url ? { url: fields.url } : {}),
          caption: fields.caption,
          heading: optionalText(record.heading, BLOCK_ITEM_HEADING_MAX_LENGTH),
          html: sanitizeRichText(record.html).slice(0, BLOCK_HTML_MAX_LENGTH),
        },
      };
    }

    case "list": {
      const items = Array.isArray(record.items)
        ? record.items.slice(0, LIST_MAX_ITEMS).map((item) => {
            const entry = asRecord(item) ?? {};
            return {
              heading: sanitizePlainText(
                entry.heading,
                BLOCK_ITEM_HEADING_MAX_LENGTH,
              ),
              html: sanitizeRichText(entry.html).slice(0, BLOCK_HTML_MAX_LENGTH),
            };
          })
        : [];
      return {
        ok: true,
        block: {
          type: "list",
          heading: sanitizePlainText(record.heading, BLOCK_HEADING_MAX_LENGTH),
          items,
        },
      };
    }

    case "table": {
      return { ok: true, block: { type: "table", rows: parseRows(record.rows) } };
    }

    case "faq": {
      const items = Array.isArray(record.items)
        ? record.items.slice(0, FAQ_MAX_ITEMS).map((item) => {
            const entry = asRecord(item) ?? {};
            return {
              question: sanitizePlainText(entry.question, BLOCK_QUESTION_MAX_LENGTH),
              html: sanitizeRichText(entry.html).slice(0, BLOCK_HTML_MAX_LENGTH),
            };
          })
        : [];
      return {
        ok: true,
        block: {
          type: "faq",
          heading: sanitizePlainText(record.heading, BLOCK_HEADING_MAX_LENGTH),
          items,
        },
      };
    }
  }
}

/** Validate an untrusted body (JSON string or value) into blocks. */
export function parsePostBlocks(value: unknown): ParseBlocksResult {
  let raw = value;

  if (typeof value === "string") {
    try {
      raw = JSON.parse(value);
    } catch {
      return { ok: false, error: "The post body is not valid JSON." };
    }
  }

  if (!Array.isArray(raw)) {
    return { ok: false, error: "The post body must be a list of blocks." };
  }

  if (raw.length > MAX_BLOCKS) {
    return {
      ok: false,
      error: `A post can have at most ${MAX_BLOCKS} blocks.`,
    };
  }

  const blocks: PostBlock[] = [];
  for (const entry of raw) {
    const parsed = parseBlock(entry);
    if (!parsed.ok) {
      return parsed;
    }
    blocks.push(parsed.block);
  }

  return { ok: true, blocks };
}

/**
 * Convert stored blocks into the editor's canonical block set without losing
 * content. Legacy paragraphs become rich-text blocks; everything else passes
 * through unchanged.
 */
export function toEditorBlocks(blocks: readonly PostBlock[]): PostBlock[] {
  return blocks.map((block) => {
    if (block.type === "paragraph") {
      return { type: "text", html: plainTextToHtml(block.text) };
    }
    if (block.type === "heading") {
      return { ...block, level: clampHeadingLevel(block.level) };
    }
    return { ...block };
  });
}

/** The unique Media IDs referenced by image-bearing blocks. */
export function collectMediaIds(blocks: readonly PostBlock[]): string[] {
  const ids = new Set<string>();
  for (const block of blocks) {
    if (block.type === "image" || block.type === "imageText") {
      if (block.mediaId) {
        ids.add(block.mediaId);
      }
    }
  }
  return [...ids];
}

export type FaqEntry = { question: string; answer: string };

/** Flatten FAQ blocks into question/answer pairs for JSON-LD. */
export function collectFaqItems(blocks: readonly PostBlock[]): FaqEntry[] {
  const entries: FaqEntry[] = [];
  for (const block of blocks) {
    if (block.type !== "faq") {
      continue;
    }
    for (const item of block.items) {
      const question = sanitizePlainText(item.question, BLOCK_QUESTION_MAX_LENGTH);
      const answer = stripHtml(item.html);
      if (question && answer) {
        entries.push({ question, answer });
      }
    }
  }
  return entries;
}

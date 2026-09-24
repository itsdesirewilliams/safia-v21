/**
 * The Post body block model (spec #2 / ADR-0005).
 *
 * A Post body is an ordered list of typed blocks stored as JSON and rendered to
 * HTML at read time. Image blocks reference a Media record by ID — never a
 * hard-coded URL — so media stays managed through the shared Media layer.
 *
 * This module is pure, so the content model is the primary test seam.
 */

export const POST_BLOCK_TYPES = ["paragraph", "heading", "image"] as const;

export type PostBlockType = (typeof POST_BLOCK_TYPES)[number];

export function isPostBlockType(value: unknown): value is PostBlockType {
  return (
    typeof value === "string" &&
    (POST_BLOCK_TYPES as readonly string[]).includes(value)
  );
}

export const BLOCK_TEXT_MAX_LENGTH = 5000;
export const BLOCK_HEADING_MAX_LENGTH = 300;
export const BLOCK_ALT_MAX_LENGTH = 300;
export const BLOCK_CAPTION_MAX_LENGTH = 500;
export const MAX_BLOCKS = 200;

export type ParagraphBlock = { type: "paragraph"; text: string };

export type HeadingBlock = { type: "heading"; level: 2 | 3; text: string };

export type ImageBlock = {
  type: "image";
  mediaId: string;
  alt: string | null;
  caption: string | null;
};

export type PostBlock = ParagraphBlock | HeadingBlock | ImageBlock;

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

function parseBlock(value: unknown): { ok: true; block: PostBlock } | { ok: false; error: string } {
  const record = asRecord(value);
  if (!record || !isPostBlockType(record.type)) {
    return { ok: false, error: "Every body block needs a valid type." };
  }

  switch (record.type) {
    case "paragraph": {
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

    case "heading": {
      const text = cleanText(record.text);
      if (!text) {
        return { ok: false, error: "A heading block needs text." };
      }
      if (text.length > BLOCK_HEADING_MAX_LENGTH) {
        return {
          ok: false,
          error: `A heading must be ${BLOCK_HEADING_MAX_LENGTH} characters or fewer.`,
        };
      }
      const level = record.level === 3 ? 3 : 2;
      return { ok: true, block: { type: "heading", level, text } };
    }

    case "image": {
      const mediaId = cleanText(record.mediaId);
      if (!mediaId) {
        return { ok: false, error: "An image block needs a Media reference." };
      }
      const alt = cleanText(record.alt);
      const caption = cleanText(record.caption);
      if (alt.length > BLOCK_ALT_MAX_LENGTH) {
        return {
          ok: false,
          error: `Image alt text must be ${BLOCK_ALT_MAX_LENGTH} characters or fewer.`,
        };
      }
      if (caption.length > BLOCK_CAPTION_MAX_LENGTH) {
        return {
          ok: false,
          error: `An image caption must be ${BLOCK_CAPTION_MAX_LENGTH} characters or fewer.`,
        };
      }
      return {
        ok: true,
        block: {
          type: "image",
          mediaId,
          alt: alt || null,
          caption: caption || null,
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

/** The unique Media IDs referenced by the image blocks in a body. */
export function collectMediaIds(blocks: readonly PostBlock[]): string[] {
  const ids = new Set<string>();
  for (const block of blocks) {
    if (block.type === "image") {
      ids.add(block.mediaId);
    }
  }
  return [...ids];
}

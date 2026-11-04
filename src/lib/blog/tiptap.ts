import type { JSONContent } from "@tiptap/core";

import type { PostBlock, TextAlign } from "./blocks";
import { escapeAttribute, escapeHtml, stripHtml } from "./html";
import { normalizeLinkHref } from "./sanitize";
import type { Media } from "@/lib/media/types";

/**
 * Conversion between the persisted PostBlock[] body and the Tiptap document
 * used by the admin editor.
 *
 * The database schema is unchanged: posts still store semantic blocks. The
 * editor converts a Tiptap document into blocks on every change, and converts
 * blocks back to HTML when an existing post is opened. This keeps the public
 * renderer, image/media references and FAQ structured data intact.
 */

type TiptapNode = JSONContent;
type TiptapMark = NonNullable<NonNullable<TiptapNode["marks"]>[number]>;

const ALIGN_VALUES = new Set<TextAlign>([
  "left",
  "center",
  "right",
  "justify",
]);

function asAlign(value: unknown): TextAlign | null {
  return typeof value === "string" && ALIGN_VALUES.has(value as TextAlign)
    ? (value as TextAlign)
    : null;
}

function styleForAlign(align: TextAlign | null): string {
  return align ? ` style="text-align:${align}"` : "";
}

function imageUrl(
  mediaId: string,
  url: string | null | undefined,
  media: ReadonlyMap<string, Media>,
): string | null {
  return media.get(mediaId)?.url ?? url ?? null;
}

function applyTextAlign(html: string, align: TextAlign | null): string {
  if (!align) {
    return html;
  }
  return html.replace(
    /<(p|h[1-6]|blockquote)(\s[^>]*)?>/gi,
    (_match, tag: string, attributes: string | undefined) =>
      `<${tag}${styleForAlign(align)}${attributes ?? ""}>`,
  );
}

/** Convert persisted blocks into the HTML that seeds Tiptap. */
export function blocksToHtml(
  blocks: readonly PostBlock[],
  media: ReadonlyMap<string, Media>,
): string {
  const html: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
        html.push(`<p>${escapeHtml(block.text).replace(/\n/g, "<br>")}</p>`);
        break;

      case "text":
        html.push(applyTextAlign(block.html, block.align ?? null));
        break;

      case "heading": {
        const level = block.level;
        html.push(
          `<h${level}${styleForAlign(block.align ?? null)}>${escapeHtml(block.text)}</h${level}>`,
        );
        break;
      }

      case "image": {
        const url = imageUrl(block.mediaId, block.url, media);
        if (!url) {
          break;
        }
        const attributes = [
          `src="${escapeAttribute(url)}"`,
          `alt="${escapeAttribute(block.alt ?? block.caption ?? "")}"`,
          `title="${escapeAttribute(block.caption ?? "")}"`,
          `data-media-id="${escapeAttribute(block.mediaId)}"`,
          block.align ? `data-align="${block.align}"` : "",
          block.width ? `data-width="${block.width}"` : "",
          block.width ? `style="width:${block.width}%"` : "",
        ]
          .filter(Boolean)
          .join(" ");
        html.push(`<img ${attributes}>`);
        break;
      }

      case "imageText": {
        const url = imageUrl(block.mediaId, block.url, media);
        if (url) {
          const attributes = [
            `src="${escapeAttribute(url)}"`,
            `alt="${escapeAttribute(block.caption ?? "")}"`,
            `title="${escapeAttribute(block.caption ?? "")}"`,
            `data-media-id="${escapeAttribute(block.mediaId)}"`,
          ].join(" ");
          html.push(`<img ${attributes}>`);
        }
        if (block.heading) {
          html.push(`<h3>${escapeHtml(block.heading)}</h3>`);
        }
        if (block.html) {
          html.push(block.html);
        }
        break;
      }

      case "list": {
        if (block.heading) {
          html.push(`<h2>${escapeHtml(block.heading)}</h2>`);
        }
        for (const item of block.items) {
          if (item.heading) {
            html.push(`<h3>${escapeHtml(item.heading)}</h3>`);
          }
          if (item.html) {
            html.push(item.html);
          }
        }
        break;
      }

      case "table": {
        if (block.rows.length === 0) {
          break;
        }
        const [header, ...body] = block.rows;
        const head = `<thead><tr>${header
          .map((cell) => `<th>${escapeHtml(cell)}</th>`)
          .join("")}</tr></thead>`;
        const rows = body
          .map(
            (row) =>
              `<tr>${row
                .map((cell) => `<td>${escapeHtml(cell)}</td>`)
                .join("")}</tr>`,
          )
          .join("");
        html.push(`<table>${head}<tbody>${rows}</tbody></table>`);
        break;
      }

      case "faq": {
        const items = block.items.map((item) => ({
          question: item.question,
          answer: stripHtml(item.html),
        }));
        html.push(
          `<div data-blog-faq data-heading="${escapeAttribute(
            block.heading,
          )}" data-items="${escapeAttribute(JSON.stringify(items))}"></div>`,
        );
        break;
      }
    }
  }

  return html.join("");
}

function renderInline(content: TiptapNode[] | undefined): string {
  if (!content) {
    return "";
  }

  return content
    .map((node) => {
      if (node.type === "hardBreak") {
        return "<br>";
      }
      if (node.type !== "text") {
        return renderInline(node.content);
      }

      let value = escapeHtml(node.text ?? "");
      const marks = [...(node.marks ?? [])];

      // Apply links last so their attributes wrap all inner marks.
      marks.sort((a, b) => {
        if (a.type === "link") return 1;
        if (b.type === "link") return -1;
        return 0;
      });

      for (const mark of marks) {
        value = applyMark(value, mark);
      }
      return value;
    })
    .join("");
}

function applyMark(value: string, mark: TiptapMark): string {
  switch (mark.type) {
    case "bold":
      return `<strong>${value}</strong>`;
    case "italic":
      return `<em>${value}</em>`;
    case "underline":
      return `<u>${value}</u>`;
    case "strike":
      return `<s>${value}</s>`;
    case "code":
      return `<code>${value}</code>`;
    case "link": {
      const href = normalizeLinkHref(String(mark.attrs?.href ?? ""));
      return href
        ? `<a href="${escapeAttribute(href)}">${value}</a>`
        : value;
    }
    default:
      return value;
  }
}

function renderListItem(node: TiptapNode): string {
  const parts: string[] = [];
  for (const child of node.content ?? []) {
    if (child.type === "paragraph") {
      parts.push(`<p>${renderInline(child.content)}</p>`);
    } else if (child.type === "bulletList" || child.type === "orderedList") {
      parts.push(renderList(child));
    } else {
      parts.push(renderInline(child.content));
    }
  }
  return parts.join("");
}

function renderList(node: TiptapNode): string {
  const tag = node.type === "orderedList" ? "ol" : "ul";
  const items = (node.content ?? [])
    .map((item) => `<li>${renderListItem(item)}</li>`)
    .join("");
  return `<${tag}>${items}</${tag}>`;
}

function renderBlockContent(node: TiptapNode): string {
  return (node.content ?? [])
    .map((child) => {
      if (child.type === "paragraph") {
        return `<p>${renderInline(child.content)}</p>`;
      }
      if (child.type === "bulletList" || child.type === "orderedList") {
        return renderList(child);
      }
      if (child.type === "blockquote") {
        return `<blockquote>${renderBlockContent(child)}</blockquote>`;
      }
      return renderInline(child.content);
    })
    .join("");
}

function tableRows(node: TiptapNode): string[][] {
  return (node.content ?? []).map((row) =>
    (row.content ?? []).map((cell) => stripHtml(renderBlockContent(cell))),
  );
}

function faqItems(value: unknown): { question: string; answer: string }[] {
  if (typeof value === "string") {
    try {
      return faqItems(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }
      const entry = item as Record<string, unknown>;
      return {
        question: typeof entry.question === "string" ? entry.question : "",
        answer: typeof entry.answer === "string" ? entry.answer : "",
      };
    })
    .filter((item): item is { question: string; answer: string } => item !== null);
}

/** Convert a Tiptap document into the persisted block model. */
export function docToBlocks(doc: TiptapNode): PostBlock[] {
  const blocks: PostBlock[] = [];

  for (const node of doc.content ?? []) {
    const align = asAlign(node.attrs?.textAlign);

    switch (node.type) {
      case "paragraph": {
        blocks.push({
          type: "text",
          html: `<p>${renderInline(node.content)}</p>`,
          ...(align ? { align } : {}),
        });
        break;
      }

      case "heading": {
        const level = Number(node.attrs?.level);
        blocks.push({
          type: "heading",
          level:
            level === 1 || level === 2 || level === 3 || level === 4 || level === 5 || level === 6
              ? level
              : 2,
          text: stripHtml(renderInline(node.content)),
          ...(align ? { align } : {}),
        });
        break;
      }

      case "bulletList":
      case "orderedList":
        blocks.push({ type: "text", html: renderList(node) });
        break;

      case "blockquote":
        blocks.push({
          type: "text",
          html: `<blockquote>${renderBlockContent(node)}</blockquote>`,
        });
        break;

      case "table": {
        const rows = tableRows(node);
        if (rows.length > 0) {
          blocks.push({ type: "table", rows });
        }
        break;
      }

      case "image": {
        const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
        if (!src) {
          break;
        }
        const mediaId =
          typeof node.attrs?.mediaId === "string" ? node.attrs.mediaId : "";
        const width = Number(node.attrs?.width);
        const imageAlign = asAlign(node.attrs?.align);
        blocks.push({
          type: "image",
          mediaId,
          ...(mediaId ? {} : { url: src }),
          alt:
            typeof node.attrs?.alt === "string" ? node.attrs.alt : null,
          caption:
            typeof node.attrs?.caption === "string"
              ? node.attrs.caption
              : typeof node.attrs?.title === "string"
                ? node.attrs.title
                : null,
          ...(imageAlign && imageAlign !== "justify"
            ? { align: imageAlign }
            : {}),
          ...(Number.isFinite(width) && width > 0 ? { width } : {}),
        });
        break;
      }

      case "faq": {
        const heading =
          typeof node.attrs?.heading === "string"
            ? node.attrs.heading
            : "Frequently asked questions";
        const items = faqItems(node.attrs?.items);
        blocks.push({
          type: "faq",
          heading,
          items: items.map((item) => ({
            question: item.question,
            html: `<p>${escapeHtml(item.answer)}</p>`,
          })),
        });
        break;
      }

      case "horizontalRule":
        blocks.push({ type: "text", html: "<hr>" });
        break;

      case "codeBlock": {
        const text = (node.content ?? [])
          .map((child) => child.text ?? "")
          .join("\n");
        blocks.push({
          type: "text",
          html: `<pre><code>${escapeHtml(text)}</code></pre>`,
        });
        break;
      }

      default:
        if (node.content) {
          blocks.push({
            type: "text",
            html: renderBlockContent(node),
          });
        }
        break;
    }
  }

  return blocks;
}

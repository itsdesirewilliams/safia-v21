// @vitest-environment jsdom
import type { JSONContent } from "@tiptap/core";
import { describe, expect, it } from "vitest";

import { docToBlocks, blocksToHtml } from "@/lib/blog/tiptap";
import { BlogImage } from "@/components/admin/blog/tiptap-image";
import { BlogFaqNode } from "@/components/admin/blog/tiptap-faq-node";
import type { Media } from "@/lib/media/types";

const media: Media = {
  id: "m1",
  bucket: "blog-images",
  path: "2026/01/pic.png",
  url: "https://example.supabase.co/storage/v1/object/public/blog-images/2026/01/pic.png",
  type: "image",
  mimeType: "image/png",
  alt: "A tyre",
  caption: "On the line",
  patternCode: null,
  categorySlug: null,
  uploadedBy: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  hidden: false,
};

function doc(content: JSONContent[]): JSONContent {
  return { type: "doc", content };
}

describe("Tiptap document conversion", () => {
  it("keeps paragraphs, hard breaks, headings and inline marks", () => {
    const blocks = docToBlocks(
      doc([
        {
          type: "heading",
          attrs: { level: 2, textAlign: "center" },
          content: [{ type: "text", text: "Section" }],
        },
        {
          type: "paragraph",
          attrs: { textAlign: "justify" },
          content: [
            { type: "text", text: "Line one" },
            { type: "hardBreak" },
            {
              type: "text",
              text: " line two",
              marks: [{ type: "bold" }, { type: "italic" }, { type: "underline" }],
            },
            { type: "text", text: " link", marks: [{ type: "link", attrs: { href: "https://example.com" } }] },
          ],
        },
      ]),
    );

    expect(blocks[0]).toEqual({
      type: "heading",
      level: 2,
      text: "Section",
      align: "center",
    });
    expect(blocks[1]).toMatchObject({ type: "text", align: "justify" });
    const html = (blocks[1] as { type: "text"; html: string }).html;
    expect(html).toContain("<p>Line one<br>");
    expect(html).toContain("line two");
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
    expect(html).toContain("<u>");
    expect(html).toContain('<a href="https://example.com">');
  });

  it("converts lists, blockquotes, tables, images and FAQs into existing blocks", () => {
    const blocks = docToBlocks(
      doc([
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "One" }] },
                { type: "paragraph", content: [{ type: "text", text: "Two" }] },
              ],
            },
          ],
        },
        {
          type: "blockquote",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Quote" }] },
          ],
        },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "A" }] }] },
                { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "B" }] }] },
              ],
            },
            {
              type: "tableRow",
              content: [
                { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "1" }] }] },
                { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "2" }] }] },
              ],
            },
          ],
        },
        {
          type: "image",
          attrs: {
            src: media.url,
            alt: "Alt",
            title: "Caption",
            mediaId: "m1",
            align: "right",
            width: 75,
          },
        },
        {
          type: "faq",
          attrs: {
            heading: "Questions",
            items: [{ question: "Why?", answer: "Because." }],
          },
        },
      ]),
    );

    expect(blocks[0]).toEqual({
      type: "text",
      html: "<ul><li><p>One</p><p>Two</p></li></ul>",
    });
    expect(blocks[1]).toEqual({
      type: "text",
      html: "<blockquote><p>Quote</p></blockquote>",
    });
    expect(blocks[2]).toEqual({
      type: "table",
      rows: [
        ["A", "B"],
        ["1", "2"],
      ],
    });
    expect(blocks[3]).toMatchObject({
      type: "image",
      mediaId: "m1",
      alt: "Alt",
      caption: "Caption",
      align: "right",
      width: 75,
    });
    expect(blocks[4]).toEqual({
      type: "faq",
      heading: "Questions",
      items: [{ question: "Why?", html: "<p>Because.</p>" }],
    });
  });

  it("seeds existing blocks, including media, FAQ and alignment, into editor HTML", () => {
    const html = blocksToHtml(
      [
        { type: "heading", level: 6, text: "Small", align: "right" },
        { type: "text", html: "<p>Aligned</p>", align: "center" },
        {
          type: "image",
          mediaId: "m1",
          alt: "Alt",
          caption: "Caption",
          align: "left",
          width: 50,
        },
        {
          type: "faq",
          heading: "Questions",
          items: [{ question: "Why?", html: "<p>Because.</p>" }],
        },
      ],
      new Map([["m1", media]]),
    );

    expect(html).toContain('<h6 style="text-align:right">Small</h6>');
    expect(html).toContain('<p style="text-align:center">Aligned</p>');
    expect(html).toContain(`src="${media.url}"`);
    expect(html).toContain('data-media-id="m1"');
    expect(html).toContain('data-align="left"');
    expect(html).toContain('data-width="50"');
    expect(html).toContain("data-blog-faq");
  });

  it("recognises the custom image and FAQ nodes by name", () => {
    expect(BlogImage.name).toBe("image");
    expect(BlogFaqNode.name).toBe("faq");
  });
});


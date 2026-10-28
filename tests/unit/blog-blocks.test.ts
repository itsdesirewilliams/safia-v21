import { describe, expect, it } from "vitest";

import {
  collectFaqItems,
  collectMediaIds,
  parsePostBlocks,
  toEditorBlocks,
} from "@/lib/blog/blocks";

describe("post block model", () => {
  it("parses a valid body from a JSON string", () => {
    const result = parsePostBlocks(
      JSON.stringify([
        { type: "paragraph", text: "Hello" },
        { type: "heading", level: 3, text: "Sub" },
        { type: "image", mediaId: "abc", alt: "Alt", caption: "Cap" },
      ]),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blocks).toEqual([
        { type: "paragraph", text: "Hello" },
        { type: "heading", level: 3, text: "Sub" },
        { type: "image", mediaId: "abc", alt: "Alt", caption: "Cap" },
      ]);
    }
  });

  it("rejects invalid JSON and non-array bodies", () => {
    expect(parsePostBlocks("{not json").ok).toBe(false);
    expect(parsePostBlocks("{}")).toEqual({
      ok: false,
      error: "The post body must be a list of blocks.",
    });
  });

  it("rejects unknown block types and an empty legacy paragraph", () => {
    expect(parsePostBlocks([{ type: "video" }]).ok).toBe(false);
    expect(parsePostBlocks([{ type: "paragraph", text: "   " }]).ok).toBe(false);
  });

  it("allows empty headings and empty image slots so drafts can be saved", () => {
    const result = parsePostBlocks([
      { type: "heading", text: "" },
      { type: "image", mediaId: "" },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blocks[0]).toEqual({ type: "heading", level: 2, text: "" });
      expect(result.blocks[1]).toEqual({
        type: "image",
        mediaId: "",
        alt: null,
        caption: null,
      });
    }
  });

  it("accepts H4 headings and sanitizes rich text", () => {
    const result = parsePostBlocks([
      { type: "heading", level: 4, text: "Small heading" },
      {
        type: "text",
        html: '<p onclick="x">Safe <strong>bold</strong> <script>alert(1)</script><a href="javascript:bad">bad</a></p>',
      },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blocks[0]).toEqual({
        type: "heading",
        level: 4,
        text: "Small heading",
      });
      const html = (result.blocks[1] as { html: string }).html;
      expect(html).toContain("<strong>bold</strong>");
      expect(html).toContain("Safe");
      expect(html).not.toContain("<script");
      expect(html).not.toContain("onclick");
      expect(html).not.toContain("javascript:");
    }
  });

  it("normalises table rows and caps the dimensions", () => {
    const result = parsePostBlocks([
      {
        type: "table",
        rows: [
          ["A", "B", "C"],
          ["1"],
        ],
      },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blocks[0]).toEqual({
        type: "table",
        rows: [
          ["A", "B", "C"],
          ["1", "", ""],
        ],
      });
    }
  });

  it("accepts list explainers, image+text and FAQ blocks", () => {
    const result = parsePostBlocks([
      {
        type: "list",
        heading: "Factors",
        items: [{ heading: "One", html: "<p>First</p>" }],
      },
      {
        type: "imageText",
        position: "right",
        mediaId: "m1",
        caption: "Cap",
        heading: "Side",
        html: "<p>Beside</p>",
      },
      {
        type: "faq",
        heading: "Questions",
        items: [{ question: "Why?", html: "<p>Because.</p>" }],
      },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blocks[0]).toMatchObject({ type: "list", heading: "Factors" });
      expect(result.blocks[1]).toMatchObject({
        type: "imageText",
        position: "right",
        mediaId: "m1",
      });
      expect(result.blocks[2]).toMatchObject({ type: "faq", heading: "Questions" });
    }
  });

  it("collects unique Media ids from image and image+text blocks", () => {
    const result = parsePostBlocks([
      { type: "image", mediaId: "a" },
      { type: "paragraph", text: "x" },
      { type: "image", mediaId: "a" },
      { type: "imageText", mediaId: "b", html: "<p>x</p>" },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(collectMediaIds(result.blocks)).toEqual(["a", "b"]);
    }
  });

  it("converts legacy paragraphs into rich text without losing content", () => {
    const blocks = toEditorBlocks([
      { type: "paragraph", text: "Line one\nLine two" },
      { type: "heading", level: 3, text: "Heading" },
    ]);

    expect(blocks[0]).toEqual({
      type: "text",
      html: "<p>Line one<br>Line two</p>",
    });
    expect(blocks[1]).toEqual({ type: "heading", level: 3, text: "Heading" });
  });

  it("flattens FAQ blocks into question and answer pairs", () => {
    const result = parsePostBlocks([
      {
        type: "faq",
        heading: "FAQ",
        items: [
          { question: "Question?", html: "<p>Answer <strong>here</strong>.</p>" },
          { question: "", html: "<p>Orphan</p>" },
        ],
      },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(collectFaqItems(result.blocks)).toEqual([
        { question: "Question?", answer: "Answer here." },
      ]);
    }
  });
});

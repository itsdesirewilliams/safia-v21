import { describe, expect, it } from "vitest";

import { collectMediaIds, parsePostBlocks } from "@/lib/blog/blocks";

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

  it("rejects unknown block types and empty text", () => {
    expect(parsePostBlocks([{ type: "video" }]).ok).toBe(false);
    expect(parsePostBlocks([{ type: "paragraph", text: "   " }]).ok).toBe(false);
    expect(parsePostBlocks([{ type: "heading", text: "" }]).ok).toBe(false);
  });

  it("requires an image block to reference a Media record", () => {
    expect(parsePostBlocks([{ type: "image", mediaId: "" }]).ok).toBe(false);
  });

  it("defaults a heading to level 2 and normalises blank alt/caption to null", () => {
    const result = parsePostBlocks([
      { type: "heading", text: "H" },
      { type: "image", mediaId: "m1" },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blocks[0]).toEqual({ type: "heading", level: 2, text: "H" });
      expect(result.blocks[1]).toEqual({
        type: "image",
        mediaId: "m1",
        alt: null,
        caption: null,
      });
    }
  });

  it("collects unique Media ids from image blocks", () => {
    const result = parsePostBlocks([
      { type: "image", mediaId: "a" },
      { type: "paragraph", text: "x" },
      { type: "image", mediaId: "a" },
      { type: "image", mediaId: "b" },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(collectMediaIds(result.blocks)).toEqual(["a", "b"]);
    }
  });
});

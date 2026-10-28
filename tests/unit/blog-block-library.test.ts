import { describe, expect, it } from "vitest";

import {
  BLOCK_COMPONENTS,
  BLOCK_TYPE_OPTIONS,
  createBlock,
} from "@/lib/blog/block-library";
import { parsePostBlocks } from "@/lib/blog/blocks";

describe("block library", () => {
  it("offers every editable block type", () => {
    expect(BLOCK_TYPE_OPTIONS.map((option) => option.type)).toEqual([
      "text",
      "heading",
      "image",
      "imageText",
      "list",
      "table",
      "faq",
    ]);
    for (const option of BLOCK_TYPE_OPTIONS) {
      expect(createBlock(option.type).type).toBe(option.type);
    }
  });

  it("parses every default block without validation errors", () => {
    const blocks = BLOCK_TYPE_OPTIONS.map((option) => createBlock(option.type));
    const result = parsePostBlocks(blocks);
    expect(result.ok).toBe(true);
  });

  it("provides the four ready-made components", () => {
    expect(BLOCK_COMPONENTS).toHaveLength(4);

    for (const component of BLOCK_COMPONENTS) {
      const blocks = component.create();
      expect(blocks.length, component.id).toBeGreaterThan(0);
      expect(parsePostBlocks(blocks).ok, component.id).toBe(true);
    }

    const fiveFactors = BLOCK_COMPONENTS.find(
      (component) => component.id === "five-factors",
    );
    const list = fiveFactors?.create()[0];
    expect(list?.type).toBe("list");
    if (list?.type === "list") {
      expect(list.items).toHaveLength(5);
    }

    const headingImageText = BLOCK_COMPONENTS.find(
      (component) => component.id === "heading-image-text",
    );
    expect(
      headingImageText?.create().map((block) => block.type),
    ).toEqual(["heading", "image", "text"]);
  });
});

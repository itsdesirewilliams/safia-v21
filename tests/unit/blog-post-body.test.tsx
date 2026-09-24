import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PostBody } from "@/components/blog/post-body";
import type { Media } from "@/lib/media/types";

const MEDIA: Media = {
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

describe("PostBody", () => {
  it("renders paragraphs, headings and image blocks from Media ids", () => {
    const html = renderToStaticMarkup(
      <PostBody
        blocks={[
          { type: "heading", level: 2, text: "Section" },
          { type: "paragraph", text: "Body copy." },
          { type: "image", mediaId: "m1", alt: null, caption: null },
        ]}
        media={new Map([["m1", MEDIA]])}
      />,
    );

    expect(html).toContain("<h2");
    expect(html).toContain("Section");
    expect(html).toContain("Body copy.");
    expect(html).toContain(MEDIA.url);
    expect(html).toContain('alt="A tyre"');
    expect(html).toContain("On the line");
  });

  it("prefers a block-level caption over the Media record", () => {
    const html = renderToStaticMarkup(
      <PostBody
        blocks={[{ type: "image", mediaId: "m1", alt: null, caption: "Block cap" }]}
        media={new Map([["m1", MEDIA]])}
      />,
    );

    expect(html).toContain("Block cap");
    expect(html).not.toContain("On the line");
  });

  it("renders a labelled stand-in when a Media reference cannot be resolved", () => {
    const html = renderToStaticMarkup(
      <PostBody
        blocks={[{ type: "image", mediaId: "missing", alt: null, caption: null }]}
        media={new Map()}
      />,
    );

    expect(html).toContain("Image unavailable");
    expect(html).not.toContain("<img");
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PostBody } from "@/components/blog/post-body";
import type { PostBlock } from "@/lib/blog/blocks";
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

describe("PostBody block editor output", () => {
  it("renders sanitized rich text with safe links", () => {
    const html = renderToStaticMarkup(
      <PostBody
        blocks={[
          {
            type: "text",
            html: '<p>Hello <strong>world</strong> <a href="https://example.com">link</a></p>',
          },
        ]}
        media={new Map()}
      />,
    );

    expect(html).toContain("<strong>world</strong>");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders H2/H3/H4 headings", () => {
    const blocks: PostBlock[] = [
      { type: "heading", level: 2, text: "Two" },
      { type: "heading", level: 3, text: "Three" },
      { type: "heading", level: 4, text: "Four" },
    ];
    const html = renderToStaticMarkup(<PostBody blocks={blocks} media={new Map()} />);

    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
    expect(html).toContain("<h4");
  });

  it("renders a list explainer with an H2 and H3 items", () => {
    const html = renderToStaticMarkup(
      <PostBody
        blocks={[
          {
            type: "list",
            heading: "Five factors",
            items: [{ heading: "First factor", html: "<p>Details.</p>" }],
          },
        ]}
        media={new Map()}
      />,
    );

    expect(html).toContain("Five factors");
    expect(html).toContain("First factor");
    expect(html).toContain("Details.");
  });

  it("renders image + text with a media image", () => {
    const html = renderToStaticMarkup(
      <PostBody
        blocks={[
          {
            type: "imageText",
            position: "right",
            mediaId: "m1",
            caption: "Beside caption",
            heading: "Beside heading",
            html: "<p>Beside text.</p>",
          },
        ]}
        media={new Map([["m1", MEDIA]])}
      />,
    );

    expect(html).toContain(MEDIA.url);
    expect(html).toContain("Beside heading");
    expect(html).toContain("Beside text.");
    expect(html).toContain("Beside caption");
  });

  it("renders tables responsively with a header row", () => {
    const html = renderToStaticMarkup(
      <PostBody
        blocks={[
          {
            type: "table",
            rows: [
              ["Size", "Pattern"],
              ["295/80R22.5", "FM-06"],
            ],
          },
        ]}
        media={new Map()}
      />,
    );

    expect(html).toContain("overflow-x-auto");
    expect(html).toContain("<table");
    expect(html).toContain("<th");
    expect(html).toContain("295/80R22.5");
    expect(html).toContain("FM-06");
  });

  it("renders FAQ items as native collapsible details", () => {
    const html = renderToStaticMarkup(
      <PostBody
        blocks={[
          {
            type: "faq",
            heading: "Questions",
            items: [{ question: "Why tyres?", html: "<p>Because they roll.</p>" }],
          },
        ]}
        media={new Map()}
      />,
    );

    expect(html).toContain("<details");
    expect(html).toContain("<summary");
    expect(html).toContain("Why tyres?");
    expect(html).toContain("Because they roll.");
  });

  it("shows placeholders for empty image slots only in preview", () => {
    const blocks: PostBlock[] = [{ type: "image", mediaId: "", alt: null, caption: null }];
    const preview = renderToStaticMarkup(
      <PostBody blocks={blocks} media={new Map()} preview />,
    );
    const publicHtml = renderToStaticMarkup(
      <PostBody blocks={blocks} media={new Map()} />,
    );

    expect(preview).toContain("Image placeholder");
    expect(publicHtml).not.toContain("Image placeholder");
  });
});
import { describe, expect, it } from "vitest";

import {
  parsePostStatus,
  POSTS_PER_PAGE,
  postSlugFromTitle,
  postStatusLabel,
  validatePostInput,
} from "@/lib/blog/post";
import { mapPostRow, toPostSummary, type PostRow } from "@/lib/blog/record";

const ROW: PostRow = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "A title",
  slug: "a-title",
  author: "Jane",
  excerpt: null,
  thumbnail_media_id: null,
  body: [{ type: "paragraph", text: "Body" }],
  status: "published",
  published_at: "2026-01-01T00:00:00.000Z",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
};

describe("post slug", () => {
  it("generates a slug from the title", () => {
    expect(postSlugFromTitle("Safeway launches a new OTR range!")).toBe(
      "safeway-launches-a-new-otr-range",
    );
  });
});

describe("post status", () => {
  it("is limited to draft and published", () => {
    expect(POSTS_PER_PAGE).toBe(12);
    expect(postStatusLabel("draft")).toBe("Draft");
    expect(postStatusLabel("published")).toBe("Published");
    expect(parsePostStatus("published")).toBe("published");
    expect(parsePostStatus("archived")).toBeNull();
    expect(parsePostStatus("scheduled")).toBeNull();
  });
});

describe("validatePostInput", () => {
  const base = {
    title: "Hello world",
    author: "Jane",
    body: [{ type: "paragraph", text: "Hi" }],
  };

  it("accepts a valid input and derives the slug from the title", () => {
    const result = validatePostInput(base);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.slug).toBe("hello-world");
      expect(result.value.body).toHaveLength(1);
      expect(result.value.excerpt).toBeNull();
    }
  });

  it("requires a title and an author", () => {
    const result = validatePostInput({ title: "  ", author: "", body: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBeTruthy();
      expect(result.errors.author).toBeTruthy();
    }
  });

  it("rejects a malformed explicit slug", () => {
    const result = validatePostInput({ ...base, slug: "Bad Slug!" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.slug).toBeTruthy();
    }
  });

  it("surfaces a body validation error", () => {
    const result = validatePostInput({ ...base, body: [{ type: "nope" }] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.body).toBeTruthy();
    }
  });
});

describe("mapPostRow", () => {
  it("maps a row and drops the body for summaries", () => {
    const post = mapPostRow(ROW);
    expect(post?.status).toBe("published");
    expect(post?.body).toHaveLength(1);

    const summary = toPostSummary(post!);
    expect(summary).not.toHaveProperty("body");
    expect(summary.title).toBe("A title");
    expect(summary.publishedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("returns null for an invalid status", () => {
    expect(mapPostRow({ ...ROW, status: "archived" })).toBeNull();
  });
});

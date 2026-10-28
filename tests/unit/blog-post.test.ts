import { describe, expect, it } from "vitest";

import {
  parsePostStatus,
  POSTS_PER_PAGE,
  postSlugFromTitle,
  postStatusLabel,
  validatePostInput,
} from "@/lib/blog/post";
import { mapPostRow, toPostSummary, type PostRow } from "@/lib/blog/record";

const BASE_INPUT = {
  title: "Hello world",
  author: "Jane",
  body: [{ type: "paragraph" as const, text: "Hi" }],
};

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

  it("requires a title when publishing and defaults a missing author", () => {
    const result = validatePostInput({ title: "  ", author: "", body: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBeTruthy();
      expect(result.errors.author).toBeUndefined();
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

describe("post SEO fields", () => {
  it("trims and keeps optional SEO overrides", () => {
    const result = validatePostInput({
      title: "Hello world",
      author: "Jane",
      body: [],
      seoTitle: "  Custom SEO title  ",
      seoDescription: "  A custom description.  ",
      ogMediaId: "  media-id  ",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.seoTitle).toBe("Custom SEO title");
      expect(result.value.seoDescription).toBe("A custom description.");
      expect(result.value.ogMediaId).toBe("media-id");
    }
  });

  it("blank SEO fields fall back to null", () => {
    const result = validatePostInput({
      title: "Hello world",
      author: "Jane",
      body: [],
      seoTitle: "   ",
      seoDescription: "",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.seoTitle).toBeNull();
      expect(result.value.seoDescription).toBeNull();
    }
  });

  it("rejects an over-long SEO title", () => {
    const result = validatePostInput({
      title: "Hello world",
      author: "Jane",
      body: [],
      seoTitle: "x".repeat(121),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.seoTitle).toBeTruthy();
    }
  });

  it("maps SEO columns, defaulting to null for older rows", () => {
    const withSeo = mapPostRow({
      ...ROW,
      seo_title: "SEO title",
      seo_description: "SEO description",
      og_media_id: "22222222-2222-2222-2222-222222222222",
    });
    expect(withSeo?.seoTitle).toBe("SEO title");
    expect(withSeo?.seoDescription).toBe("SEO description");
    expect(withSeo?.ogMediaId).toBe("22222222-2222-2222-2222-222222222222");

    const legacy = mapPostRow(ROW);
    expect(legacy?.seoTitle).toBeNull();
    expect(legacy?.seoDescription).toBeNull();
    expect(legacy?.ogMediaId).toBeNull();
  });
});
  it("allows a completely empty draft with a generated placeholder slug", () => {
    const result = validatePostInput(
      { title: "", author: "", body: [] },
      { requireTitle: false, now: new Date("2026-03-01T00:00:00.000Z"), random: () => 0.5 },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("");
      expect(result.value.author).toBe("");
      expect(result.value.slug).toMatch(/^draft-/);
    }
  });

  it("validates the optional category against the catalogue", () => {
    const valid = validatePostInput({ ...BASE_INPUT, category: "agriculture" });
    expect(valid.ok).toBe(true);
    if (valid.ok) {
      expect(valid.value.category).toBe("agriculture");
    }

    const invalid = validatePostInput({ ...BASE_INPUT, category: "not-a-category" });
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) {
      expect(invalid.errors.category).toBeTruthy();
    }
  });

  it("replaces a placeholder draft slug with a real slug on publish", () => {
    const result = validatePostInput(
      { ...BASE_INPUT, slug: "draft-abc-123" },
      { requireTitle: true },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.slug).toBe("hello-world");
    }
  });
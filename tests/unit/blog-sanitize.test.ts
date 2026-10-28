import { describe, expect, it } from "vitest";

import {
  normalizeImageSrc,
  normalizeLinkHref,
  sanitizeRichText,
} from "@/lib/blog/sanitize";
import { decodeEntities, sanitizePlainText, stripHtml } from "@/lib/blog/html";

describe("rich text sanitizer", () => {
  it("keeps the allow-listed inline tags and closes unbalanced markup", () => {
    const html = sanitizeRichText(
      "<p>Hello <strong>bold</strong> <em>italic</em> <u>under</u><br></p>",
    );
    expect(html).toBe(
      "<p>Hello <strong>bold</strong> <em>italic</em> <u>under</u><br></p>",
    );

    expect(sanitizeRichText("<p>Open <strong>bold")).toBe(
      "<p>Open <strong>bold</strong></p>",
    );
  });

  it("drops scripts, styles, event handlers and unknown tags", () => {
    const html = sanitizeRichText(
      '<p onclick="alert(1)">Safe <script>alert(1)</script><span style="color:red">text</span></p>',
    );

    expect(html).not.toContain("<script");
    expect(html).not.toContain("<span");
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("style=");
    expect(html).toContain("Safe");
    expect(html).toContain("text");
  });

  it("removes unsafe links but keeps their text", () => {
    const html = sanitizeRichText(
      '<p><a href="javascript:alert(1)">bad</a> <a href="https://example.com">good</a></p>',
    );

    expect(html).not.toContain("javascript:");
    expect(html).toContain("bad");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("adds rel but no target to internal links", () => {
    const html = sanitizeRichText('<p><a href="/about-us">About</a></p>');
    expect(html).toContain('href="/about-us"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain('target="_blank"');
  });

  it("escapes text and decodes common entities", () => {
    const html = sanitizeRichText("<p>Fish &amp; chips &lt; 5</p>");
    expect(html).toContain("Fish &amp; chips &lt; 5");
    expect(html).not.toContain("< 5");
  });

  it("rejects data and vbscript URLs", () => {
    expect(sanitizeRichText('<p><a href="data:text/html,x">x</a></p>')).not.toContain(
      "data:",
    );
    expect(
      sanitizeRichText('<p><a href="vbscript:msgbox(1)">x</a></p>'),
    ).not.toContain("vbscript:");
  });
});

describe("link normalisation", () => {
  it("adds https to bare hostnames", () => {
    expect(normalizeLinkHref("example.com")).toBe("https://example.com");
    expect(normalizeLinkHref("www.example.com/path")).toBe(
      "https://www.example.com/path",
    );
  });

  it("keeps safe schemes and relative links", () => {
    expect(normalizeLinkHref("https://example.com")).toBe("https://example.com");
    expect(normalizeLinkHref("mailto:hello@example.com")).toBe(
      "mailto:hello@example.com",
    );
    expect(normalizeLinkHref("tel:+123")).toBe("tel:+123");
    expect(normalizeLinkHref("/about-us")).toBe("/about-us");
    expect(normalizeLinkHref("#faq")).toBe("#faq");
  });

  it("rejects unsafe schemes and whitespace", () => {
    expect(normalizeLinkHref("javascript:alert(1)")).toBeNull();
    expect(normalizeLinkHref("data:text/html,x")).toBeNull();
    expect(normalizeLinkHref("https://example.com/a b")).toBeNull();
    expect(normalizeLinkHref("")).toBeNull();
  });

  it("only accepts http(s) or site-relative image sources", () => {
    expect(normalizeImageSrc("/assets/a.png")).toBe("/assets/a.png");
    expect(normalizeImageSrc("https://cdn.example.com/a.png")).toBe(
      "https://cdn.example.com/a.png",
    );
    expect(normalizeImageSrc("javascript:alert(1)")).toBeNull();
  });
});

describe("plain text helpers", () => {
  it("decodes entities and strips tags", () => {
    expect(decodeEntities("A &amp; B")).toBe("A & B");
    expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
    expect(sanitizePlainText("<p>  spaced   out  </p>", 20)).toBe("spaced out");
  });
});

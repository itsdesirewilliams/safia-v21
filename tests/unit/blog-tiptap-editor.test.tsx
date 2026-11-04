// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TiptapBodyEditor } from "@/components/admin/blog/tiptap-editor";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
  Element.prototype.scrollIntoView = vi.fn();
  const rect = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    toJSON: () => ({}),
  });
  const rects = () => [] as DOMRect[];
  Object.defineProperty(window.Node.prototype, "getClientRects", {
    configurable: true,
    value: rects,
  });
  Object.defineProperty(window.Node.prototype, "getBoundingClientRect", {
    configurable: true,
    value: rect,
  });
  Object.defineProperty(window.Range.prototype, "getClientRects", {
    configurable: true,
    value: rects,
  });
  Object.defineProperty(window.Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: rect,
  });
  document.elementFromPoint = () => document.querySelector(".ProseMirror");
});

afterEach(cleanup);

describe("TiptapBodyEditor", () => {
  it("loads existing blocks and exposes the heading selector", async () => {
    const { container } = render(
      <TiptapBodyEditor
        initialBlocks={[
          { type: "text", html: "<p>Intro paragraph</p>" },
          { type: "heading", level: 2, text: "Section" },
        ]}
        media={[]}
        onMediaUploaded={() => {}}
        onChange={() => {}}
      />,
    );

    await waitFor(() => {
      expect(container.querySelector(".ProseMirror")).toBeTruthy();
    });
    expect(container.textContent).toContain("Intro paragraph");
    expect(container.textContent).toContain("Section");
    expect(screen.getByRole("button", { name: "Underline" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Strike" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Text style: Paragraph/ }),
    ).toBeTruthy();
  });

  it("lists all six heading levels in the selector", async () => {
    render(
      <TiptapBodyEditor
        initialBlocks={[{ type: "text", html: "<p>Heading target</p>" }]}
        media={[]}
        onMediaUploaded={() => {}}
        onChange={() => {}}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Text style:/ })).toBeTruthy();
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Text style:/ }));
    for (let level = 1; level <= 6; level += 1) {
      expect(await screen.findByText(`Heading ${level}`)).toBeTruthy();
    }
  });
});




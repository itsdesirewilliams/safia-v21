"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";

export type FaqNodeItem = {
  question: string;
  answer: string;
};

function readItems(value: unknown): FaqNodeItem[] {
  if (typeof value === "string") {
    try {
      return readItems(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }
      const entry = item as Record<string, unknown>;
      return {
        question: typeof entry.question === "string" ? entry.question : "",
        answer: typeof entry.answer === "string" ? entry.answer : "",
      };
    })
    .filter((item): item is FaqNodeItem => item !== null);
}

function FaqNodeView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const heading =
    typeof node.attrs.heading === "string"
      ? node.attrs.heading
      : "Frequently asked questions";
  const items = readItems(node.attrs.items);

  const setItems = (next: FaqNodeItem[]) => {
    updateAttributes({ items: next });
  };

  return (
    <NodeViewWrapper className="blog-faq-node" contentEditable={false}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
            FAQ section
          </p>
          <p className="mt-1 text-xs text-ink-500">
            The questions become the public accordion and FAQ structured data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => deleteNode()}
          className="rounded-md px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50"
        >
          Remove section
        </button>
      </div>

      <label className="mt-3 block text-xs font-semibold text-ink-600">
        Section heading
        <input
          value={heading}
          onChange={(event) => updateAttributes({ heading: event.target.value })}
          className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-normal text-ink-900 outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15"
          placeholder="Frequently asked questions"
        />
      </label>

      <div className="mt-3 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-ink-200 bg-ink-50/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                Question {index + 1}
              </span>
              <button
                type="button"
                onClick={() => setItems(items.filter((_, i) => i !== index))}
                className="rounded-md px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-white"
              >
                Remove
              </button>
            </div>
            <input
              value={item.question}
              onChange={(event) =>
                setItems(
                  items.map((entry, i) =>
                    i === index ? { ...entry, question: event.target.value } : entry,
                  ),
                )
              }
              className="mt-2 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15"
              placeholder="Question"
            />
            <textarea
              value={item.answer}
              onChange={(event) =>
                setItems(
                  items.map((entry, i) =>
                    i === index ? { ...entry, answer: event.target.value } : entry,
                  ),
                )
              }
              rows={3}
              className="mt-2 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15"
              placeholder="Answer"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setItems([...items, { question: "", answer: "" }])}
        className="mt-3 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-50"
      >
        + Add question
      </button>
    </NodeViewWrapper>
  );
}

export const BlogFaqNode = Node.create({
  name: "faq",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      heading: { default: "Frequently asked questions" },
      items: {
        default: [{ question: "Question", answer: "Answer" }],
        parseHTML: (element) => readItems(element.getAttribute("data-items")),
        renderHTML: (attributes) => ({
          "data-items": JSON.stringify(readItems(attributes.items)),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-blog-faq]",
        getAttrs: (element) => ({
          heading: element.getAttribute("data-heading") ?? "Frequently asked questions",
          items: readItems(element.getAttribute("data-items")),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-blog-faq": "",
        "data-heading": HTMLAttributes.heading ?? "Frequently asked questions",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FaqNodeView);
  },
});

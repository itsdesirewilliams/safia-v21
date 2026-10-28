"use client";

import { useId } from "react";

import { ImageDropzone } from "@/components/admin/blog/image-dropzone";
import { RichTextEditor } from "@/components/admin/blog/rich-text-editor";
import { TableBlockEditor } from "@/components/admin/blog/table-block-editor";
import { buttonStyles } from "@/components/ui/button";
import {
  compactFieldClass,
  fieldClass,
  fieldLabelClass,
} from "@/components/ui/form";
import type { PostBlock } from "@/lib/blog/blocks";
import { plainTextToHtml } from "@/lib/blog/html";
import type { Media } from "@/lib/media/types";

type CommonProps = {
  block: PostBlock;
  onChange: (block: PostBlock) => void;
  media: readonly Media[];
  onMediaUploaded: (media: Media) => void;
};

/** Renders the editable fields for one block type. */
export function BlockEditor({
  block,
  onChange,
  media,
  onMediaUploaded,
}: CommonProps) {
  const id = useId();
  switch (block.type) {
    case "paragraph":
      return (
        <RichTextEditor
          value={plainTextToHtml(block.text)}
          onChange={(html) => onChange({ type: "text", html })}
          ariaLabel="Paragraph text"
          placeholder="Write a paragraph…"
        />
      );

    case "text":
      return (
        <RichTextEditor
          value={block.html}
          onChange={(html) => onChange({ type: "text", html })}
          ariaLabel="Text block"
          placeholder="Write the paragraph. Press Enter for a new paragraph."
        />
      );

    case "heading":
      return (
        <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
          <div>
            <label className={fieldLabelClass} htmlFor={`${id}-heading-level`}>
              Level
            </label>
            <select
              id={`${id}-heading-level`}
              value={block.level}
              onChange={(event) =>
                onChange({
                  ...block,
                  level:
                    event.target.value === "4"
                      ? 4
                      : event.target.value === "3"
                        ? 3
                        : 2,
                })
              }
              className={fieldClass}
            >
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
              <option value="4">Heading 4</option>
            </select>
          </div>
          <div>
            <label className={fieldLabelClass} htmlFor={`${id}-heading-text`}>
              Heading text
            </label>
            <input
              id={`${id}-heading-text`}
              value={block.text}
              onChange={(event) => onChange({ ...block, text: event.target.value })}
              placeholder="Section heading"
              className={fieldClass}
            />
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-3">
          <ImageDropzone
            value={{ mediaId: block.mediaId || null, url: block.url ?? null, alt: block.alt }}
            onChange={(value) =>
              onChange({
                ...block,
                mediaId: value.mediaId ?? "",
                ...(value.url ? { url: value.url } : { url: null }),
                alt: value.alt ?? null,
              })
            }
            media={media}
            onMediaUploaded={onMediaUploaded}
            label="Image block"
            hint="The caption is also used as the image alt text."
          />
          <div>
            <label className={fieldLabelClass} htmlFor={`${id}-image-caption`}>
              Caption / alt text
            </label>
            <input
              id={`${id}-image-caption`}
              value={block.caption ?? ""}
              onChange={(event) =>
                onChange({
                  ...block,
                  caption: event.target.value || null,
                  alt: event.target.value || null,
                })
              }
              placeholder="Describe the image (used as alt text and caption)"
              className={fieldClass}
            />
          </div>
        </div>
      );

    case "imageText":
      return (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <div>
              <label className={fieldLabelClass} htmlFor={`${id}-image-text-position`}>
                Image position
              </label>
              <select
                id={`${id}-image-text-position`}
                value={block.position}
                onChange={(event) =>
                  onChange({
                    ...block,
                    position: event.target.value === "right" ? "right" : "left",
                  })
                }
                className={fieldClass}
              >
                <option value="left">Image left</option>
                <option value="right">Image right</option>
              </select>
            </div>
            <div>
              <label className={fieldLabelClass} htmlFor={`${id}-image-text-heading`}>
                Optional heading
              </label>
              <input
                id={`${id}-image-text-heading`}
                value={block.heading ?? ""}
                onChange={(event) =>
                  onChange({ ...block, heading: event.target.value || null })
                }
                placeholder="Heading beside the image"
                className={fieldClass}
              />
            </div>
          </div>

          <ImageDropzone
            value={{ mediaId: block.mediaId || null, url: block.url ?? null, alt: block.caption }}
            onChange={(value) =>
              onChange({
                ...block,
                mediaId: value.mediaId ?? "",
                ...(value.url ? { url: value.url } : { url: null }),
              })
            }
            media={media}
            onMediaUploaded={onMediaUploaded}
            label="Beside-text image"
          />

          <div>
            <label className={fieldLabelClass} htmlFor={`${id}-image-text-caption`}>
              Caption / alt text
            </label>
            <input
              id={`${id}-image-text-caption`}
              value={block.caption ?? ""}
              onChange={(event) =>
                onChange({ ...block, caption: event.target.value || null })
              }
              placeholder="Describe the image"
              className={fieldClass}
            />
          </div>

          <RichTextEditor
            value={block.html}
            onChange={(html) => onChange({ ...block, html })}
            ariaLabel="Image and text body"
            placeholder="Write the text that sits beside the image."
          />
        </div>
      );

    case "list":
      return (
        <div className="space-y-4">
          <div>
            <label className={fieldLabelClass} htmlFor={`${id}-list-heading`}>
              Section heading (H2)
            </label>
            <input
              id={`${id}-list-heading`}
              value={block.heading}
              onChange={(event) => onChange({ ...block, heading: event.target.value })}
              placeholder="e.g. Five factors to consider"
              className={fieldClass}
            />
          </div>

          <div className="space-y-3">
            {block.items.map((item, index) => (
              <div key={index} className="rounded-lg border border-ink-200 bg-ink-50/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                    Factor {index + 1}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const items = [...block.items];
                        items.splice(index + 1, 0, { ...item });
                        onChange({ ...block, items });
                      }}
                      className="rounded-md px-2 py-1 text-xs font-semibold text-ink-600 hover:bg-white"
                      aria-label={`Duplicate factor ${index + 1}`}
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...block,
                          items: block.items.filter((_, itemIndex) => itemIndex !== index),
                        })
                      }
                      className="rounded-md px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-white"
                      aria-label={`Delete factor ${index + 1}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <label className="sr-only" htmlFor={`${id}-list-item-heading-${index}`}>
                  Factor {index + 1} heading
                </label>
                <input
                  id={`${id}-list-item-heading-${index}`}
                  value={item.heading}
                  onChange={(event) => {
                    const items = [...block.items];
                    items[index] = { ...item, heading: event.target.value };
                    onChange({ ...block, items });
                  }}
                  placeholder="Factor heading (H3)"
                  className={`${compactFieldClass} mt-2`}
                />
                <div className="mt-2">
                  <RichTextEditor
                    value={item.html}
                    onChange={(html) => {
                      const items = [...block.items];
                      items[index] = { ...item, html };
                      onChange({ ...block, items });
                    }}
                    ariaLabel={`Factor ${index + 1} text`}
                    placeholder="Explain this factor…"
                    minHeightClass="min-h-[5rem]"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              onChange({
                ...block,
                items: [...block.items, { heading: "", html: "<p></p>" }],
              })
            }
            className={buttonStyles("outline", "sm")}
          >
            + Add factor
          </button>
        </div>
      );

    case "table":
      return (
        <TableBlockEditor
          rows={block.rows}
          onChange={(rows) => onChange({ ...block, rows })}
        />
      );

    case "faq":
      return (
        <div className="space-y-4">
          <div>
            <label className={fieldLabelClass} htmlFor={`${id}-faq-heading`}>
              Section heading (H2)
            </label>
            <input
              id={`${id}-faq-heading`}
              value={block.heading}
              onChange={(event) => onChange({ ...block, heading: event.target.value })}
              placeholder="Frequently asked questions"
              className={fieldClass}
            />
          </div>

          <div className="space-y-3">
            {block.items.map((item, index) => (
              <div key={index} className="rounded-lg border border-ink-200 bg-ink-50/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                    Question {index + 1}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const items = [...block.items];
                        items.splice(index + 1, 0, { ...item });
                        onChange({ ...block, items });
                      }}
                      className="rounded-md px-2 py-1 text-xs font-semibold text-ink-600 hover:bg-white"
                      aria-label={`Duplicate question ${index + 1}`}
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...block,
                          items: block.items.filter((_, itemIndex) => itemIndex !== index),
                        })
                      }
                      className="rounded-md px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-white"
                      aria-label={`Delete question ${index + 1}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <label className="sr-only" htmlFor={`${id}-faq-question-${index}`}>
                  Question {index + 1}
                </label>
                <input
                  id={`${id}-faq-question-${index}`}
                  value={item.question}
                  onChange={(event) => {
                    const items = [...block.items];
                    items[index] = { ...item, question: event.target.value };
                    onChange({ ...block, items });
                  }}
                  placeholder="Question"
                  className={`${compactFieldClass} mt-2`}
                />
                <div className="mt-2">
                  <RichTextEditor
                    value={item.html}
                    onChange={(html) => {
                      const items = [...block.items];
                      items[index] = { ...item, html };
                      onChange({ ...block, items });
                    }}
                    ariaLabel={`Answer ${index + 1}`}
                    placeholder="Answer the question…"
                    minHeightClass="min-h-[5rem]"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              onChange({
                ...block,
                items: [...block.items, { question: "", html: "<p></p>" }],
              })
            }
            className={buttonStyles("outline", "sm")}
          >
            + Add question
          </button>
        </div>
      );
  }
}

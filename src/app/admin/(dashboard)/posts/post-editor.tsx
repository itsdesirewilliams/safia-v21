"use client";

import { useActionState, useRef, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { fieldClass, fieldLabelClass } from "@/components/ui/form";
import { INITIAL_POST_ACTION_STATE } from "@/lib/blog/action-state";
import type { PostBlock } from "@/lib/blog/blocks";
import type { MediaOption } from "@/lib/blog/media-options";

import { savePostAction } from "./actions";

type EditorBlock = { key: string; block: PostBlock };

export type PostEditorProps = {
  mode: "create" | "edit";
  postId?: string;
  mediaOptions: readonly MediaOption[];
  defaults: {
    title: string;
    slug: string;
    author: string;
    excerpt: string;
    thumbnailMediaId: string | null;
    body: PostBlock[];
  };
};

function newBlock(type: PostBlock["type"]): PostBlock {
  switch (type) {
    case "heading":
      return { type: "heading", level: 2, text: "" };
    case "image":
      return { type: "image", mediaId: "", alt: null, caption: null };
    case "paragraph":
    default:
      return { type: "paragraph", text: "" };
  }
}

/**
 * The Post editor: metadata fields plus a block body editor (paragraph,
 * heading, image). Image blocks reference a Media record by id — never a URL —
 * per ADR-0005. The body is submitted as JSON and validated server-side.
 */
export function PostEditor({
  mode,
  postId,
  mediaOptions,
  defaults,
}: PostEditorProps) {
  const [state, formAction, isPending] = useActionState(
    savePostAction,
    INITIAL_POST_ACTION_STATE,
  );

  const nextKey = useRef(defaults.body.length);
  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    defaults.body.map((block, index) => ({ key: `b${index}`, block })),
  );

  function addBlock(type: PostBlock["type"]) {
    setBlocks((current) => [
      ...current,
      { key: `b${nextKey.current++}`, block: newBlock(type) },
    ]);
  }

  function updateBlock(key: string, block: PostBlock) {
    setBlocks((current) =>
      current.map((entry) => (entry.key === key ? { ...entry, block } : entry)),
    );
  }

  function removeBlock(key: string) {
    setBlocks((current) => current.filter((entry) => entry.key !== key));
  }

  function moveBlock(key: string, direction: -1 | 1) {
    setBlocks((current) => {
      const index = current.findIndex((entry) => entry.key === key);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) {
        return current;
      }
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  }

  return (
    <form action={formAction} className="mt-8 space-y-8">
      {postId && <input type="hidden" name="postId" value={postId} />}
      <input
        type="hidden"
        name="body"
        value={JSON.stringify(blocks.map((entry) => entry.block))}
      />

      <section className="rounded-card border border-ink-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-ink-950">Details</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="post-title" className={fieldLabelClass}>
              Title
            </label>
            <input
              id="post-title"
              name="title"
              required
              defaultValue={defaults.title}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="post-slug" className={fieldLabelClass}>
              Slug (leave blank to generate from the title)
            </label>
            <input
              id="post-slug"
              name="slug"
              defaultValue={defaults.slug}
              placeholder="auto-generated-from-title"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="post-author" className={fieldLabelClass}>
              Author
            </label>
            <input
              id="post-author"
              name="author"
              required
              defaultValue={defaults.author}
              className={fieldClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="post-excerpt" className={fieldLabelClass}>
              Excerpt (optional)
            </label>
            <textarea
              id="post-excerpt"
              name="excerpt"
              rows={2}
              defaultValue={defaults.excerpt}
              className={fieldClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="post-thumbnail" className={fieldLabelClass}>
              Thumbnail (optional)
            </label>
            <select
              id="post-thumbnail"
              name="thumbnailMediaId"
              defaultValue={defaults.thumbnailMediaId ?? ""}
              className={fieldClass}
            >
              <option value="">No thumbnail</option>
              {mediaOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {mediaOptions.length === 0 && (
              <p className="mt-2 text-xs text-ink-500">
                No images are in the Media library yet. Upload one under Media to
                use it here.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-card border border-ink-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink-950">Body</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => addBlock("paragraph")}
              className={buttonStyles("outline", "sm")}
            >
              + Paragraph
            </button>
            <button
              type="button"
              onClick={() => addBlock("heading")}
              className={buttonStyles("outline", "sm")}
            >
              + Heading
            </button>
            <button
              type="button"
              onClick={() => addBlock("image")}
              className={buttonStyles("outline", "sm")}
            >
              + Image
            </button>
          </div>
        </div>

        {blocks.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-ink-300 bg-ink-50 p-6 text-sm text-ink-600">
            The body is empty. Add a paragraph, heading or image block above.
          </p>
        ) : (
          <ol className="mt-5 space-y-4">
            {blocks.map((entry, index) => {
              const block = entry.block;

              return (
                <li
                  key={entry.key}
                  className="rounded-xl border border-ink-200 bg-ink-50/60 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                      {block.type}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveBlock(entry.key, -1)}
                        disabled={index === 0}
                        aria-label="Move block up"
                        className={buttonStyles("outline", "sm")}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(entry.key, 1)}
                        disabled={index === blocks.length - 1}
                        aria-label="Move block down"
                        className={buttonStyles("outline", "sm")}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(entry.key)}
                        className={buttonStyles("accent", "sm")}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    {block.type === "paragraph" && (
                      <textarea
                        value={block.text}
                        onChange={(event) =>
                          updateBlock(entry.key, {
                            type: "paragraph",
                            text: event.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Paragraph text"
                        className={fieldClass}
                      />
                    )}

                    {block.type === "heading" && (
                      <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
                        <select
                          value={block.level}
                          onChange={(event) =>
                            updateBlock(entry.key, {
                              type: "heading",
                              level: event.target.value === "3" ? 3 : 2,
                              text: block.text,
                            })
                          }
                          className={fieldClass}
                          aria-label="Heading level"
                        >
                          <option value="2">Heading 2</option>
                          <option value="3">Heading 3</option>
                        </select>
                        <input
                          value={block.text}
                          onChange={(event) =>
                            updateBlock(entry.key, {
                              type: "heading",
                              level: block.level,
                              text: event.target.value,
                            })
                          }
                          placeholder="Heading text"
                          className={fieldClass}
                        />
                      </div>
                    )}

                    {block.type === "image" && (
                      <div className="space-y-3">
                        <select
                          value={block.mediaId}
                          onChange={(event) =>
                            updateBlock(entry.key, {
                              type: "image",
                              mediaId: event.target.value,
                              alt: block.alt,
                              caption: block.caption,
                            })
                          }
                          className={fieldClass}
                          aria-label="Image media"
                        >
                          <option value="">Choose an image…</option>
                          {mediaOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <input
                          value={block.alt ?? ""}
                          onChange={(event) =>
                            updateBlock(entry.key, {
                              type: "image",
                              mediaId: block.mediaId,
                              alt: event.target.value || null,
                              caption: block.caption,
                            })
                          }
                          placeholder="Alt text (optional)"
                          className={fieldClass}
                        />
                        <input
                          value={block.caption ?? ""}
                          onChange={(event) =>
                            updateBlock(entry.key, {
                              type: "image",
                              mediaId: block.mediaId,
                              alt: block.alt,
                              caption: event.target.value || null,
                            })
                          }
                          placeholder="Caption (optional)"
                          className={fieldClass}
                        />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className={buttonStyles("primary", "md")}
        >
          {isPending
            ? "Saving…"
            : mode === "create"
              ? "Create draft"
              : "Save changes"}
        </button>
        {state.status === "success" && (
          <p role="status" className="text-sm font-medium text-success-600">
            {state.message}
          </p>
        )}
        {state.status === "error" && (
          <p role="alert" className="text-sm font-medium text-brand-600">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

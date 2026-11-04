"use client";

import { useRef, useState } from "react";
import { useEditorState, type Editor } from "@tiptap/react";

import { ImagePlusIcon } from "@/components/tiptap-icons/image-plus-icon";
import { AlignLeftIcon } from "@/components/tiptap-icons/align-left-icon";
import { AlignCenterIcon } from "@/components/tiptap-icons/align-center-icon";
import { AlignRightIcon } from "@/components/tiptap-icons/align-right-icon";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { cn } from "@/lib/cn";
import {
  ACCEPTED_IMAGE_TYPES,
  optimiseImage,
  uploadImage,
  validateImageFile,
} from "@/lib/blog/image-client";
import type { Media } from "@/lib/media/types";

/**
 * Image insertion is intentionally wired to the existing direct-to-Supabase
 * upload client, so the Media library and post image references keep working.
 */
export function TiptapImageButton({
  editor,
  onUploaded,
}: {
  editor: Editor;
  onUploaded: (media: Media) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageState = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      active: current?.isActive("image") ?? false,
      align: String(current?.getAttributes("image").align ?? "center"),
      width: Number(current?.getAttributes("image").width ?? 0),
    }),
  });

  async function takeFile(file: File | undefined) {
    if (!file || busy) return;
    const validation = validateImageFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const prepared = await optimiseImage(file);
      const media = await uploadImage(prepared, {
        alt: file.name.replace(/\.[a-z0-9]+$/i, "") || "Blog image",
      });
      onUploaded(media);
      editor
        .chain()
        .focus(editor.isActive("table") ? "end" : undefined)
        .insertContent({
          type: "image",
          attrs: {
            src: media.url,
            alt: media.alt ?? "Blog image",
            title: media.caption ?? "",
            caption: media.caption ?? "",
            mediaId: media.id,
            align: "center",
            width: 100,
          },
        })
        .run();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The image could not be uploaded.",
      );
    } finally {
      setBusy(false);
    }
  }

  function setImageAttrs(attrs: Record<string, unknown>) {
    editor.chain().focus().updateAttributes("image", attrs).run();
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => {
          void takeFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <Button
        type="button"
        data-style="ghost"
        aria-label="Upload image"
        tooltip={busy ? "Uploading image" : "Upload image"}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlusIcon className="tiptap-button-icon" />
        <span className="tiptap-button-text">{busy ? "Uploading…" : "Image"}</span>
      </Button>

      {imageState?.active && (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            data-style="ghost"
            data-active-state={imageState.align === "left" ? "on" : "off"}
            aria-label="Align image left"
            tooltip="Align image left"
            onClick={() => setImageAttrs({ align: "left" })}
          >
            <AlignLeftIcon className="tiptap-button-icon" />
          </Button>
          <Button
            type="button"
            data-style="ghost"
            data-active-state={imageState.align === "center" ? "on" : "off"}
            aria-label="Center image"
            tooltip="Center image"
            onClick={() => setImageAttrs({ align: "center" })}
          >
            <AlignCenterIcon className="tiptap-button-icon" />
          </Button>
          <Button
            type="button"
            data-style="ghost"
            data-active-state={imageState.align === "right" ? "on" : "off"}
            aria-label="Align image right"
            tooltip="Align image right"
            onClick={() => setImageAttrs({ align: "right" })}
          >
            <AlignRightIcon className="tiptap-button-icon" />
          </Button>
          <label className="sr-only" htmlFor="blog-image-width">
            Image width
          </label>
          <select
            id="blog-image-width"
            value={imageState.width || 100}
            onChange={(event) => setImageAttrs({ width: Number(event.target.value) })}
            className="h-8 rounded-md border border-ink-200 bg-white px-1.5 text-xs text-ink-700"
          >
            {[25, 50, 75, 100].map((value) => (
              <option key={value} value={value}>
                {value}%
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <span role="alert" className="text-xs font-semibold text-brand-600">
          {error}
        </span>
      )}
    </div>
  );
}

export function TiptapTableButton({ editor }: { editor: Editor }) {
  const tableActive = useEditorState({
    editor,
    selector: ({ editor: current }) => current?.isActive("table") ?? false,
  });

  if (!tableActive) {
    return (
      <Button
        type="button"
        data-style="ghost"
        aria-label="Insert table"
        tooltip="Insert a 3×3 table"
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        <span className="text-[11px] font-semibold">Table</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        data-style="ghost"
        tooltip="Add row below"
        aria-label="Add row below"
        onClick={() => editor.chain().focus().addRowAfter().run()}
      >
        <span className="text-[11px]">+Row</span>
      </Button>
      <Button
        type="button"
        data-style="ghost"
        tooltip="Add column right"
        aria-label="Add column right"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      >
        <span className="text-[11px]">+Col</span>
      </Button>
      <Button
        type="button"
        data-style="ghost"
        tooltip="Delete row"
        aria-label="Delete row"
        onClick={() => editor.chain().focus().deleteRow().run()}
      >
        <span className="text-[11px]">−Row</span>
      </Button>
      <Button
        type="button"
        data-style="ghost"
        tooltip="Delete column"
        aria-label="Delete column"
        onClick={() => editor.chain().focus().deleteColumn().run()}
      >
        <span className="text-[11px]">−Col</span>
      </Button>
      <Button
        type="button"
        data-style="ghost"
        tooltip="Delete table"
        aria-label="Delete table"
        onClick={() => editor.chain().focus().deleteTable().run()}
      >
        <span className="text-[11px] text-brand-600">Delete</span>
      </Button>
    </div>
  );
}

export function TiptapFaqButton({ editor }: { editor: Editor }) {
  return (
    <Button
      type="button"
      data-style="ghost"
      aria-label="Insert FAQ section"
      tooltip="Insert FAQ section"
      onClick={() =>
        editor
          .chain()
          // A block-level FAQ cannot live inside a table cell. If the cursor
          // is in a table, append it at the end instead of silently failing.
          .focus("end")
          .insertContent({
            type: "faq",
            attrs: {
              heading: "Frequently asked questions",
              items: [{ question: "Question", answer: "Answer" }],
            },
          })
          .run()
      }
    >
      <span className={cn("text-[11px] font-semibold")}>FAQ</span>
    </Button>
  );
}

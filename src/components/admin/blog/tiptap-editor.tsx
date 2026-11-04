"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  EditorContent,
  EditorContext,
  useEditor,
  type JSONContent,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";

import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { LinkPopover } from "@/components/tiptap-ui/link-popover";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

import { BlogFaqNode } from "@/components/admin/blog/tiptap-faq-node";
import { HeadingSelect } from "@/components/admin/blog/tiptap-heading-select";
import { BlogImage } from "@/components/admin/blog/tiptap-image";
import {
  TiptapFaqButton,
  TiptapImageButton,
  TiptapTableButton,
} from "@/components/admin/blog/tiptap-extra-controls";
import { blocksToHtml, docToBlocks } from "@/lib/blog/tiptap";
import type { PostBlock } from "@/lib/blog/blocks";
import type { Media } from "@/lib/media/types";

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/admin/blog/tiptap-editor.scss";

export type TiptapBodyEditorProps = {
  initialBlocks: readonly PostBlock[];
  media: readonly Media[];
  onMediaUploaded: (media: Media) => void;
  onChange: (blocks: PostBlock[]) => void;
};

/**
 * Tiptap Simple Editor (MIT template) adapted to the existing Safeway post
 * model. The editor owns the whole article while it is open; each change is
 * converted back into the persisted PostBlock[] schema, so the public blog
 * renderer and media/FAQ handling remain unchanged.
 */
export function TiptapBodyEditor({
  initialBlocks,
  media,
  onMediaUploaded,
  onChange,
}: TiptapBodyEditorProps) {
  const mediaById = useMemo(
    () => new Map(media.map((entry) => [entry.id, entry])),
    [media],
  );
  const [initialHtml] = useState(() => blocksToHtml(initialBlocks, mediaById));
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);


  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: "safeway-tiptap-content",
        spellcheck: "true",
        "aria-label": "Article body",
      },
    },
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      BlogImage,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      BlogFaqNode,
      Placeholder.configure({
        placeholder:
          "Write your article here, or paste a complete formatted article from anywhere. Use Enter for a new paragraph and Shift + Enter for a line break.",
      }),
    ],
    content: initialHtml || "<p></p>",
    onUpdate: ({ editor: current }) => {
      onChangeRef.current(docToBlocks(current.getJSON() as JSONContent));
    },
  });

  if (!editor) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-lg border border-ink-200 bg-ink-50 text-sm text-ink-500">
        Loading the editor…
      </div>
    );
  }

  return (
    <div className="safeway-tiptap min-w-0 rounded-card border border-ink-200 bg-white">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar variant="fixed">
          <ToolbarGroup>
            <UndoRedoButton editor={editor} action="undo" />
            <UndoRedoButton editor={editor} action="redo" />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <HeadingSelect editor={editor} />
          </ToolbarGroup>

          <ToolbarGroup>
            <ListDropdownMenu
              editor={editor}
              types={["bulletList", "orderedList"]}
            />
            <BlockquoteButton editor={editor} />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <MarkButton editor={editor} type="bold" />
            <MarkButton editor={editor} type="italic" />
            <MarkButton editor={editor} type="underline" />
            <MarkButton editor={editor} type="strike" />
          </ToolbarGroup>

          <ToolbarGroup>
            <LinkPopover editor={editor} />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <TextAlignButton editor={editor} align="left" />
            <TextAlignButton editor={editor} align="center" />
            <TextAlignButton editor={editor} align="right" />
            <TextAlignButton editor={editor} align="justify" />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <TiptapImageButton editor={editor} onUploaded={onMediaUploaded} />
            <TiptapTableButton editor={editor} />
            <TiptapFaqButton editor={editor} />
          </ToolbarGroup>

          <Spacer />
        </Toolbar>

        <EditorContent editor={editor} />
      </EditorContext.Provider>
    </div>
  );
}





"use client";

import { useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";

import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon";
import { Button } from "@/components/tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu";
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card";

const OPTIONS = [
  { label: "Paragraph", value: 0 },
  { label: "Heading 1", value: 1 },
  { label: "Heading 2", value: 2 },
  { label: "Heading 3", value: 3 },
  { label: "Heading 4", value: 4 },
  { label: "Heading 5", value: 5 },
  { label: "Heading 6", value: 6 },
] as const;

/**
 * The template's heading menu shows only an icon. Writers need to see the
 * current block type, so this variant keeps the same menu primitives and adds
 * a live "Paragraph" / "Heading N" label.
 */
export function HeadingSelect({ editor }: { editor: Editor }) {
  const current = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) return 0;
      for (let level = 1; level <= 6; level += 1) {
        if (currentEditor.isActive("heading", { level })) {
          return level;
        }
      }
      return 0;
    },
  });

  const label =
    OPTIONS.find((option) => option.value === current)?.label ?? "Paragraph";

  function setType(level: number) {
    const chain = editor.chain().focus();
    if (level === 0) {
      chain.setParagraph().run();
    } else {
      chain.setHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          aria-label={`Text style: ${label}`}
          tooltip="Paragraph or heading"
          className="blog-heading-select"
        >
          <span>{label}</span>
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <Card>
          <CardBody>
            <div className="flex flex-col gap-0.5">
              {OPTIONS.map((option) => (
                <DropdownMenuItem key={option.value} asChild>
                  <button
                    type="button"
                    onClick={() => setType(option.value)}
                    data-active-state={current === option.value ? "on" : "off"}
                    className="rounded-md px-3 py-2 text-left text-sm text-ink-800 hover:bg-ink-50 data-[active-state=on]:bg-ink-100 data-[active-state=on]:font-semibold"
                  >
                    {option.label}
                  </button>
                </DropdownMenuItem>
              ))}
            </div>
          </CardBody>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

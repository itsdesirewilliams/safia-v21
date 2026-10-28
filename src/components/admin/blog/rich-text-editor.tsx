"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
} from "react";

import { cn } from "@/lib/cn";
import { escapeHtml } from "@/lib/blog/html";
import { normalizeLinkHref, sanitizeRichText } from "@/lib/blog/sanitize";

type ToolbarPosition = { top: number; left: number };

/**
 * A small contenteditable rich-text field with a floating Bold / Italic /
 * Underline / Link toolbar. Pasting is converted to plain text so foreign
 * styles never enter the body. The server sanitizes the stored HTML again.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write here…",
  ariaLabel,
  minHeightClass = "min-h-[7rem]",
  className,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  ariaLabel: string;
  minHeightClass?: string;
  className?: string;
}) {
  const linkInputId = useId();
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const linkOpenRef = useRef(false);
  const [toolbar, setToolbar] = useState<ToolbarPosition | null>(null);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [hasExistingLink, setHasExistingLink] = useState(false);

  // Populate the editor once, and only overwrite it when the value changes
  // from outside (for example after loading a post) and the field is idle.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    if (document.activeElement !== editor && editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  const emit = useCallback(() => {
    const editor = editorRef.current;
    if (editor) {
      onChange(editor.innerHTML);
    }
  }, [onChange]);

  const updateToolbar = useCallback(() => {
    if (linkOpenRef.current) {
      return;
    }
    const editor = editorRef.current;
    const selection = document.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) {
      setToolbar(null);
      return;
    }
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer) || range.collapsed) {
      setToolbar(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setToolbar(null);
      return;
    }

    const left = Math.min(
      Math.max(rect.left + rect.width / 2, 140),
      window.innerWidth - 140,
    );
    const top = rect.top > 70 ? rect.top - 52 : rect.bottom + 10;
    setToolbar({ top, left });

    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    } catch {
      setActiveFormats({ bold: false, italic: false, underline: false });
    }
  }, []);

  useEffect(() => {
    const onSelectionChange = () => updateToolbar();
    const onScroll = () => updateToolbar();
    document.addEventListener("selectionchange", onSelectionChange);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateToolbar]);

  function command(name: string) {
    editorRef.current?.focus();
    document.execCommand(name, false);
    emit();
    updateToolbar();
  }

  function openLink() {
    const selection = document.getSelection();
    const editor = editorRef.current;
    if (!selection || !editor || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0).cloneRange();
    savedRangeRef.current = range;

    const node = range.commonAncestorContainer;
    const element =
      node.nodeType === Node.ELEMENT_NODE
        ? (node as HTMLElement)
        : node.parentElement;
    const anchor = element?.closest("a");
    setHasExistingLink(Boolean(anchor));
    setLinkValue(anchor?.getAttribute("href") ?? "");
    linkOpenRef.current = true;
    setLinkOpen(true);
  }

  function applyLink() {
    const range = savedRangeRef.current;
    const editor = editorRef.current;
    if (!range || !editor) {
      linkOpenRef.current = false;
      setLinkOpen(false);
      return;
    }

    editor.focus();
    const selection = document.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    const href = normalizeLinkHref(linkValue);
    if (!href) {
      if (hasExistingLink) {
        document.execCommand("unlink", false);
      }
      linkOpenRef.current = false;
      setLinkOpen(false);
      emit();
      updateToolbar();
      return;
    }

    document.execCommand("createLink", false, href);

    // Apply safe link attributes immediately for the in-editor view.
    const current = document.getSelection();
    const anchorNode = current?.anchorNode;
    const anchorElement =
      anchorNode?.nodeType === Node.TEXT_NODE
        ? anchorNode.parentElement
        : (anchorNode as HTMLElement | null);
    const anchor = anchorElement?.closest("a");
    if (anchor) {
      const external = /^https?:\/\//i.test(href);
      if (external) {
        anchor.setAttribute("target", "_blank");
      } else {
        anchor.removeAttribute("target");
      }
      anchor.setAttribute("rel", "noopener noreferrer");
    }

    linkOpenRef.current = false;
    setLinkOpen(false);
    emit();
    updateToolbar();
  }

  function removeLink() {
    const editor = editorRef.current;
    const range = savedRangeRef.current;
    if (!editor || !range) {
      return;
    }
    editor.focus();
    const selection = document.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    document.execCommand("unlink", false);
    linkOpenRef.current = false;
    setLinkOpen(false);
    emit();
    updateToolbar();
  }

  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    const text =
      event.clipboardData.getData("text/plain") ||
      event.clipboardData.getData("text/html").replace(/<[^>]*>/g, " ");
    if (!text) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    const html = text
      .replace(/\r\n?/g, "\n")
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
      .join("");
    document.execCommand("insertHTML", false, html);
    emit();
  }

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        spellCheck
        data-placeholder={placeholder}
        onFocus={() => {
          document.execCommand("defaultParagraphSeparator", false, "p");
        }}
        onInput={emit}
        onPaste={onPaste}
        onBlur={() => {
          if (linkOpenRef.current) {
            return;
          }
          const editor = editorRef.current;
          if (editor) {
            const clean = sanitizeRichText(editor.innerHTML);
            if (clean !== editor.innerHTML) {
              editor.innerHTML = clean;
              onChange(clean);
            }
          }
        }}
        className={cn(
          "w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-ink-900 outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15",
          "empty:before:pointer-events-none empty:before:text-ink-400 empty:before:content-[attr(data-placeholder)]",
          minHeightClass,
          className,
        )}
      />

      {toolbar && !linkOpen && (
        <div
          role="toolbar"
          aria-label="Text formatting"
          className="fixed z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-ink-200 bg-white p-1 shadow-card"
          style={{ top: toolbar.top, left: toolbar.left }}
        >
          <ToolbarButton
            label="Bold"
            pressed={activeFormats.bold}
            onAction={() => command("bold")}
          >
            <span className="font-bold">B</span>
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            pressed={activeFormats.italic}
            onAction={() => command("italic")}
          >
            <span className="italic">I</span>
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            pressed={activeFormats.underline}
            onAction={() => command("underline")}
          >
            <span className="underline">U</span>
          </ToolbarButton>
          <ToolbarButton label="Link" onAction={openLink} wide>
            <span className="text-[11px] font-semibold">Link</span>
          </ToolbarButton>
        </div>
      )}

      {toolbar && linkOpen && (
        <div
          role="dialog"
          aria-label="Edit link"
          className="fixed z-50 flex w-80 -translate-x-1/2 flex-col gap-2 rounded-lg border border-ink-200 bg-white p-3 shadow-card"
          style={{ top: toolbar.top, left: toolbar.left }}
        >
          <label
            htmlFor={linkInputId}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500"
          >
            Link URL
          </label>
          <input
            id={linkInputId}
            autoFocus
            value={linkValue}
            onChange={(event) => setLinkValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }
              if (event.key === "Escape") {
                linkOpenRef.current = false;
                setLinkOpen(false);
              }
            }}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyLink}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
              >
                Apply
              </button>
              {hasExistingLink && (
                <button
                  type="button"
                  onClick={removeLink}
                  className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50"
                >
                  Remove
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                linkOpenRef.current = false;
                setLinkOpen(false);
              }}
              className="text-xs font-semibold text-ink-500 hover:text-ink-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  pressed,
  onAction,
  wide = false,
  children,
}: {
  label: string;
  pressed?: boolean;
  onAction: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onAction}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-md text-sm text-ink-800 hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
        wide ? "w-auto px-2" : "w-8",
        pressed && "bg-ink-100 text-brand-700",
      )}
    >
      {children}
    </button>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import {
  BLOCK_COMPONENTS,
  BLOCK_TYPE_OPTIONS,
  createBlock,
  type BlockComponent,
} from "@/lib/blog/block-library";
import type { PostBlock } from "@/lib/blog/blocks";

/** A compact insert menu used between blocks and at the end of the post. */
export function InsertBlockMenu({
  onInsertBlock,
  onInsertComponent,
  label = "Insert block",
  subtle = false,
}: {
  onInsertBlock: (block: PostBlock) => void;
  onInsertComponent: (component: BlockComponent) => void;
  label?: string;
  subtle?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
        className={
          subtle
            ? "mx-auto flex items-center gap-2 rounded-full border border-dashed border-ink-300 bg-white px-3 py-1 text-xs font-semibold text-ink-500 hover:border-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
            : buttonStyles("outline", "sm")
        }
      >
        <span aria-hidden="true">+</span> {label}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Insert block"
          className="absolute left-0 top-full z-30 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-card border border-ink-200 bg-white p-3 shadow-card"
        >
          <p className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
            Blocks
          </p>
          <div className="mt-2 grid gap-1">
            {BLOCK_TYPE_OPTIONS.map((option) => (
              <button
                key={option.type}
                type="button"
                onClick={() => {
                  onInsertBlock(createBlock(option.type));
                  setOpen(false);
                }}
                className="rounded-lg px-2 py-1.5 text-left hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
              >
                <span className="block text-sm font-semibold text-ink-900">
                  {option.label}
                </span>
                <span className="block text-xs text-ink-500">
                  {option.description}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-3 border-t border-ink-100 px-1 pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
            Ready-made
          </p>
          <div className="mt-2 grid gap-1">
            {BLOCK_COMPONENTS.map((component) => (
              <button
                key={component.id}
                type="button"
                onClick={() => {
                  onInsertComponent(component);
                  setOpen(false);
                }}
                className="rounded-lg px-2 py-1.5 text-left hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
              >
                <span className="block text-sm font-semibold text-ink-900">
                  {component.label}
                </span>
                <span className="block text-xs text-ink-500">
                  {component.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

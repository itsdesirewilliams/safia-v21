"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export function OverlayPanel({
  open,
  onClose,
  labelledBy,
  title,
  children,
  placement = "drawer",
  descriptionId,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  title: string;
  children: ReactNode;
  placement?: "drawer" | "centre";
  descriptionId?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-ink-950/55 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(
          "absolute flex w-full max-w-full flex-col overflow-x-hidden bg-white shadow-2xl outline-none",
          placement === "drawer"
            ? "inset-x-0 bottom-0 top-auto max-h-[92dvh] rounded-t-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-none sm:w-full sm:max-w-xl sm:rounded-none sm:border-l sm:border-ink-200"
            : "inset-x-0 bottom-0 top-auto max-h-[92dvh] rounded-t-2xl sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[88vh] sm:max-w-2xl sm:rounded-card sm:border sm:border-ink-200",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-200 px-5 py-4 sm:px-6">
          <h2
            id={labelledBy}
            className="text-lg font-semibold tracking-tight text-ink-950"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-200 text-xl leading-none text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-950"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), video, [tabindex]:not([tabindex="-1"])';

export type UseModalDialogOptions = {
  /** The dialog container, used for the Tab focus trap. */
  dialogRef: RefObject<HTMLElement | null>;
  /** The element focused when the dialog opens. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Called on Escape and when the caller decides to dismiss. */
  onClose: () => void;
  /**
   * Extra key handling (e.g. arrow navigation). Call `event.preventDefault()`
   * to stop the default focus-trap handling for that key.
   */
  onKeyDown?: (event: KeyboardEvent) => void;
};

/**
 * The shared modal-dialog behaviour used by the Quality First video viewer and
 * the Gallery image viewer: Escape to close, a simple Tab focus trap, body
 * scroll lock while open, and focus restoration to the previously-focused
 * element on close.
 */
export function useModalDialog({
  dialogRef,
  initialFocusRef,
  onClose,
  onKeyDown,
}: UseModalDialogOptions) {
  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    initialFocusRef?.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [dialogRef, initialFocusRef, onClose, onKeyDown]);
}

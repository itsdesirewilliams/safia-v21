"use client";

import { useId, type KeyboardEvent, type ReactNode, type Ref } from "react";

import { cn } from "@/lib/cn";

/**
 * The shared search field (icon + input + optional overlay). It carries the
 * combobox ARIA wiring so the homepage hero and the `/search` page expose the
 * same accessible control; callers own the value and the results.
 */
export function SearchInput({
  value,
  onChange,
  onKeyDown,
  onFocus,
  ariaLabel,
  placeholder,
  autoFocus,
  inputRef,
  listId,
  open = false,
  activeDescendant,
  overlay,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  ariaLabel: string;
  placeholder?: string;
  autoFocus?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  listId?: string;
  open?: boolean;
  activeDescendant?: string;
  overlay?: ReactNode;
  className?: string;
}) {
  const inputId = useId();

  return (
    <>
      <label htmlFor={inputId} className="sr-only">
        {ariaLabel}
      </label>
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m20 20-3.5-3.5" />
        </svg>
        <input
          id={inputId}
          ref={inputRef}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          placeholder={placeholder}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeDescendant}
          autoComplete="off"
          className={cn(
            "w-full rounded-lg border bg-white py-4 pl-14 pr-5 text-base font-medium text-ink-900 outline-none transition focus:ring-4 focus:ring-brand-500/30",
            className,
          )}
        />
        {overlay}
      </div>
    </>
  );
}

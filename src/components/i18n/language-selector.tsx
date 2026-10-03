"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { LOCALE_META, LOCALE_ORDER, type Locale } from "@/lib/i18n/config";
import { switchLocaleHref } from "@/lib/i18n/url";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cn(
        "h-3 w-3 transition-transform duration-200",
        open && "rotate-180",
      )}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4 text-brand-600"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 10.5 3.5 3.5L15 7" />
    </svg>
  );
}

/**
 * The public language selector. Compact closed state (`EN ▾`), full language
 * names in the dropdown, keyboard accessible, closes on outside click / Escape /
 * selection. It never uses country flags.
 */
export function LanguageSelector({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function remember() {
    // The proxy persists the chosen language as a cookie on navigation.
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 items-center gap-1 rounded-full border border-ink-200 px-3 text-xs font-semibold text-ink-700 transition-colors hover:border-ink-300 hover:text-ink-950"
      >
        {LOCALE_META[locale].short}
        <Chevron open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute end-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border border-ink-200 bg-white py-1 shadow-pop"
        >
          {LOCALE_ORDER.map((option) => {
            const current = option === locale;
            return (
              <li key={option} role="option" aria-selected={current}>
                <Link
                  href={switchLocaleHref(option, pathname)}
                  onClick={remember}
                  dir={LOCALE_META[option].dir}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3.5 py-2 text-sm transition-colors",
                    current
                      ? "bg-ink-50 font-semibold text-ink-950"
                      : "text-ink-700 hover:bg-ink-50 hover:text-ink-950",
                  )}
                >
                  <span>{LOCALE_META[option].nativeName}</span>
                  {current && <CheckIcon />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

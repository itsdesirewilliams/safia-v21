"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { CountryFlag } from "@/components/ui/country-flag";
import { cn } from "@/lib/cn";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_META,
  LOCALE_ORDER,
  type Locale,
} from "@/lib/i18n/config";
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
 * Remember the visitor's choice before the navigation starts, so the server
 * treats the new language as the explicit choice even on the canonical root
 * URL (which otherwise redirects to the last remembered language).
 */
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

/**
 * The public language selector. The closed state shows the compact locale code
 * and the flag of the language's reference country; the dropdown lists every
 * supported language with its own name, its reference country and that
 * country's SVG flag (never an emoji). Keyboard accessible: the trigger is a
 * button, the list is an ARIA listbox driven with the arrow keys, Enter and
 * Escape.
 *
 * Choosing a language navigates to the same page under the new language
 * prefix and then refreshes the server tree. The refresh matters: every
 * language is served from the same route (the proxy rewrites `/fr/about-us`
 * to `/about-us`), so without it the client router would keep the segments it
 * already has and the page would stay in the previous language.
 */
export function LanguageSelector({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  /** The path a pending language switch is waiting to land on. */
  const pendingPath = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // A language switch only changes the URL prefix, and every language is
  // served from the same route, so the client router keeps the tree it
  // already has. Once the new URL has landed, refetch it so the page is
  // actually rendered in the chosen language.
  useEffect(() => {
    const target = pendingPath.current;
    if (!target || target !== pathname) {
      return;
    }
    pendingPath.current = null;
    router.refresh();
  }, [pathname, router]);

  const choose = useCallback(
    (option: Locale) => {
      setOpen(false);
      triggerRef.current?.focus();

      if (option === locale) {
        return;
      }

      const href = switchLocaleHref(option, pathname);
      rememberLocale(option);
      pendingPath.current = href;
      router.push(href);
    },
    [locale, pathname, router],
  );

  function onListKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % LOCALE_ORDER.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex(
          (index) => (index - 1 + LOCALE_ORDER.length) % LOCALE_ORDER.length,
        );
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(LOCALE_ORDER.length - 1);
        break;
      case "Enter":
      case " ": {
        event.preventDefault();
        const option = LOCALE_ORDER[activeIndex];
        if (option) {
          choose(option);
        }
        break;
      }
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  function openList() {
    setActiveIndex(Math.max(0, LOCALE_ORDER.indexOf(locale)));
    setOpen(true);
  }

  const meta = LOCALE_META[locale];

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${meta.nativeName} (${meta.short})`}
        onClick={() => (open ? setOpen(false) : openList())}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-ink-200 px-3 text-xs font-semibold text-ink-700 transition-colors hover:border-ink-300 hover:text-ink-950"
      >
        <span aria-hidden="true">
          <CountryFlag
            code={meta.countryCode}
            country={meta.country}
            flagClassName="h-3 w-auto"
          />
        </span>
        {meta.short}
        <Chevron open={open} />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`language-option-${LOCALE_ORDER[activeIndex]}`}
          onKeyDown={onListKeyDown}
          className="absolute end-0 z-50 mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-lg border border-ink-200 bg-white py-1 shadow-pop"
        >
          {LOCALE_ORDER.map((option, index) => {
            const current = option === locale;
            const meta = LOCALE_META[option];
            return (
              <li
                key={option}
                id={`language-option-${option}`}
                role="option"
                aria-selected={current}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2 transition-colors",
                  index === activeIndex && "bg-ink-50",
                )}
              >
                <Link
                  href={switchLocaleHref(option, pathname)}
                  tabIndex={-1}
                  onClick={() => choose(option)}
                  lang={option}
                  className={cn(
                    "flex flex-1 items-center gap-3 text-sm",
                    current
                      ? "font-semibold text-ink-950"
                      : "text-ink-700 hover:text-ink-950",
                  )}
                >
                  <span aria-hidden="true">
                    <CountryFlag
                      code={meta.countryCode}
                      country={meta.country}
                      flagClassName="h-4 w-auto"
                    />
                  </span>
                  {/* `dir="auto"` aligns each name with its own script while
                      the flag column stays in the same place for every row. */}
                  <span className="flex flex-col">
                    <span dir="auto">{meta.nativeName}</span>
                    <span dir="auto" className="text-xs text-ink-500">
                      {meta.country}
                    </span>
                  </span>
                </Link>
                {current && <CheckIcon />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

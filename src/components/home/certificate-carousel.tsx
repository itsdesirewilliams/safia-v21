"use client";

import { useState } from "react";

import { ArrowIcon } from "@/components/ui/button";
import type { Certificate } from "@/lib/media/certification-assets";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
      />
    </svg>
  );
}

/**
 * The homepage certificate viewer: one certificate at a time with simple
 * previous/next controls. Each slide links to the actual PDF so the visitor can
 * open the document; the displayed name is derived from the supplied filename,
 * never invented.
 */
export function CertificateCarousel({
  certificates,
}: {
  certificates: readonly Certificate[];
}) {
  const [index, setIndex] = useState(0);
  const count = certificates.length;

  if (count === 0) {
    return null;
  }

  const current = certificates[Math.min(index, count - 1)];

  function move(delta: number) {
    setIndex((value) => (value + delta + count) % count);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-500">Certificates</p>
        {count > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous certificate"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 transition-colors hover:border-ink-300 hover:bg-ink-50"
            >
              <Chevron direction="left" />
            </button>
            <span
              aria-live="polite"
              className="min-w-[3.5rem] text-center text-xs font-medium text-ink-500"
            >
              {index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next certificate"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-900 transition-colors hover:border-ink-300 hover:bg-ink-50"
            >
              <Chevron direction="right" />
            </button>
          </div>
        )}
      </div>

      <a
        href={current.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-3 flex items-center justify-between gap-4 rounded-lg border border-ink-200 bg-white px-4 py-3.5 transition-colors hover:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-950 text-white">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.25 3.75H7.5A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V7.5l-3.75-3.75Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 3.75V7.5H18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 13.5h7.5M8.25 16.5h4.5" />
            </svg>
          </span>
          <span className="min-w-0">
            <span
              className="block truncate text-sm font-semibold text-ink-950"
              title={current.name}
            >
              {current.name}
            </span>
            <span className="block text-xs text-ink-500">
              PDF · opens in a new tab
            </span>
          </span>
        </span>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-colors group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
          <ArrowIcon className="h-4 w-4" />
        </span>
      </a>
    </div>
  );
}

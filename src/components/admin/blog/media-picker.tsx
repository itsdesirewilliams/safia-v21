"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { mediaLabel } from "@/lib/blog/media-options";
import type { Media } from "@/lib/media/types";

import { fieldClass } from "@/components/ui/form";

/** A native-dialog Media picker used as the secondary action on image slots. */
export function MediaPicker({
  open,
  onClose,
  media,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  media: readonly Media[];
  onSelect: (media: Media) => void;
}) {
  const searchId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return media;
    }
    return media.filter((entry) => mediaLabel(entry).toLowerCase().includes(term));
  }, [media, query]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-label="Choose an image from the library"
      className="m-auto w-[min(92vw,54rem)] max-h-[82vh] overflow-hidden rounded-card border border-ink-200 bg-white p-0 text-ink-900 backdrop:bg-ink-950/50"
    >
      <div className="flex items-center justify-between gap-4 border-b border-ink-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-ink-950">Media library</h2>
          <p className="text-sm text-ink-600">
            Choose an existing image, or close this and upload a new one.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
        >
          Close
        </button>
      </div>

      <div className="border-b border-ink-200 px-5 py-3">
        <label htmlFor={searchId} className="sr-only">
          Search the media library
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by caption or filename"
          className={fieldClass}
        />
      </div>

      <div className="max-h-[58vh] overflow-y-auto p-5">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-500">
            {media.length === 0
              ? "The media library has no images yet. Upload one from this image slot."
              : "No images match that search."}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(entry);
                    onClose();
                  }}
                  className="group w-full overflow-hidden rounded-lg border border-ink-200 bg-white text-left transition hover:border-brand-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                >
                  <span className="block aspect-[4/3] overflow-hidden bg-ink-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                      loading="lazy"
                    />
                  </span>
                  <span className="block truncate px-3 py-2 text-xs font-semibold text-ink-700">
                    {mediaLabel(entry)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}

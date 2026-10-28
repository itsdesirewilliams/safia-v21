"use client";

import { useRef, useState } from "react";

import { MediaPicker } from "@/components/admin/blog/media-picker";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  ACCEPTED_IMAGE_TYPES,
  optimiseImage,
  uploadImage,
  validateImageFile,
} from "@/lib/blog/image-client";
import type { Media } from "@/lib/media/types";

export type ImageSlotValue = {
  mediaId: string | null;
  url: string | null;
  alt?: string | null;
};

/**
 * A self-contained image slot: drop, click to browse or paste from the
 * clipboard. Uploads go straight to the Media layer, so the file also appears
 * in the library. "Choose from library" stays as a secondary action.
 */
export function ImageDropzone({
  value,
  onChange,
  media,
  onMediaUploaded,
  label,
  hint,
  aspect = "aspect-[4/3]",
  uploadAlt,
}: {
  value: ImageSlotValue;
  onChange: (value: ImageSlotValue) => void;
  media: readonly Media[];
  onMediaUploaded?: (media: Media) => void;
  label: string;
  hint?: string;
  aspect?: string;
  uploadAlt?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [optimising, setOptimising] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = value.mediaId
    ? media.find((entry) => entry.id === value.mediaId)
    : undefined;
  const previewUrl = value.url ?? selected?.url ?? null;

  async function handleFile(file: File) {
    const validation = validateImageFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setError(null);
    setBusy(true);
    setOptimising(true);
    setProgress(0);
    try {
      const prepared = await optimiseImage(file);
      setOptimising(false);
      const uploaded = await uploadImage(prepared, {
        alt: uploadAlt ?? label,
        onProgress: setProgress,
      });
      onMediaUploaded?.(uploaded);
      onChange({
        mediaId: uploaded.id,
        url: uploaded.url,
        alt: uploaded.alt,
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "The upload failed.",
      );
    } finally {
      setBusy(false);
      setOptimising(false);
    }
  }

  function takeFiles(files: FileList | null) {
    const file = files?.[0];
    if (file && !busy) {
      void handleFile(file);
    }
  }

  return (
    <div className="space-y-2">
      <div
        role="group"
        tabIndex={0}
        aria-label={`${label} image upload`}
        className={cn(
          "relative overflow-hidden rounded-lg border bg-ink-50 transition",
          dragActive
            ? "border-brand-600 ring-4 ring-brand-500/15"
            : "border-dashed border-ink-300",
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          takeFiles(event.dataTransfer.files);
        }}
        onPaste={(event) => {
          const file =
            event.clipboardData.files?.[0] ??
            Array.from(event.clipboardData.items)
              .find((item) => item.kind === "file")
              ?.getAsFile() ??
            null;
          if (file) {
            event.preventDefault();
            void handleFile(file);
          }
        }}
      >
        {previewUrl ? (
          <div className={cn("relative bg-ink-100", aspect)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={value.alt ?? selected?.alt ?? label}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-ink-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20",
              aspect,
            )}
          >
            <span className="text-base font-semibold text-ink-800">{label}</span>
            <span>
              Drag an image here, click to browse, or paste from the clipboard.
            </span>
            <span className="text-xs text-ink-400">
              JPG, PNG, WebP or AVIF · up to 10 MB
            </span>
          </button>
        )}

        {busy && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/85 p-4 text-center">
            <p className="text-sm font-semibold text-ink-800">
              {optimising ? "Optimising image…" : `Uploading… ${progress}%`}
            </p>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={optimising ? undefined : progress}
              aria-label="Image upload progress"
              className="h-2 w-40 overflow-hidden rounded-full bg-ink-200"
            >
              <span
                className="block h-full rounded-full bg-brand-600 transition-[width] duration-200"
                style={{ width: `${optimising ? 12 : progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        aria-label={label}
        onChange={(event) => {
          takeFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {hint && !error && <p className="text-xs text-ink-500">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-semibold text-brand-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={buttonStyles("outline", "sm")}
        >
          {previewUrl ? "Replace image" : "Upload image"}
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={busy}
          className={buttonStyles("outline", "sm")}
        >
          Choose from library
        </button>
        {previewUrl && (
          <button
            type="button"
            onClick={() => onChange({ mediaId: null, url: null, alt: null })}
            disabled={busy}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-500 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
          >
            Remove
          </button>
        )}
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        media={media}
        onSelect={(entry) =>
          onChange({
            mediaId: entry.id,
            url: entry.url,
            alt: entry.alt,
          })
        }
      />
    </div>
  );
}

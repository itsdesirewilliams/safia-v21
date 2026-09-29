"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import {
  GALLERY_BATCH_MAX,
  GALLERY_IMAGE_ACCEPT,
  GALLERY_BUCKET_ID,
  type GalleryBatchEntry,
  type GalleryBatchFailure,
} from "@/lib/media/gallery-batch";
import { formatFileSize } from "@/lib/media/format";
import { buildStoragePath, validateUpload } from "@/lib/media/upload";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";

import { createGalleryRecordsAction } from "./actions";

type ItemStatus = "pending" | "uploading" | "done" | "failed";

type Item = {
  id: string;
  file: File;
  status: ItemStatus;
  error?: string;
};

const CONCURRENCY = 3;

/**
 * Gallery bulk upload. The browser uploads each image straight to Supabase
 * Storage (so large batches never hit the server-action body limit), then a
 * single server action creates the Media records. Each file is tracked
 * independently: failures are listed for retry and never cancel the batch.
 */
export function GalleryBulkUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);

  function addFiles(files: FileList | File[] | null) {
    if (!files) {
      return;
    }
    const next = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "pending" as ItemStatus,
    }));
    setItems((previous) => [...previous, ...next].slice(0, GALLERY_BATCH_MAX));
  }

  function retryFailed() {
    setItems((previous) =>
      previous.map((item) =>
        item.status === "failed"
          ? { ...item, status: "pending", error: undefined }
          : item,
      ),
    );
    void upload();
  }

  async function upload() {
    const pending = items.filter((item) => item.status !== "done");
    if (pending.length === 0 || running) {
      return;
    }

    setRunning(true);
    const supabase = createSupabaseBrowserClient();
    const outcomes = new Map<
      string,
      { ok: boolean; error?: string; entry?: GalleryBatchEntry }
    >();

    let cursor = 0;

    async function worker() {
      while (cursor < pending.length) {
        const item = pending[cursor];
        cursor += 1;

        setItems((previous) =>
          previous.map((entry) =>
            entry.id === item.id
              ? { ...entry, status: "uploading", error: undefined }
              : entry,
          ),
        );

        const validation = validateUpload({
          fileName: item.file.name,
          mimeType: item.file.type,
          sizeBytes: item.file.size,
        });

        if (!validation.ok) {
          outcomes.set(item.id, { ok: false, error: validation.error });
          setItems((previous) =>
            previous.map((entry) =>
              entry.id === item.id
                ? { ...entry, status: "failed", error: validation.error }
                : entry,
            ),
          );
          continue;
        }

        const path = buildStoragePath({
          safeName: validation.safeName,
          id: item.id,
          createdAt: new Date(),
        });

        try {
          const upload = await supabase.storage
            .from(GALLERY_BUCKET_ID)
            .upload(path, item.file, {
              contentType: item.file.type || undefined,
              upsert: false,
            });

          if (upload.error) {
            throw new Error(upload.error.message);
          }

          outcomes.set(item.id, {
            ok: true,
            entry: {
              name: item.file.name,
              path,
              mimeType: item.file.type,
              sizeBytes: item.file.size,
            },
          });
          setItems((previous) =>
            previous.map((entry) =>
              entry.id === item.id
                ? { ...entry, status: "uploading", error: undefined }
                : entry,
            ),
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Upload failed.";
          outcomes.set(item.id, { ok: false, error: message });
          setItems((previous) =>
            previous.map((entry) =>
              entry.id === item.id
                ? { ...entry, status: "failed", error: message }
                : entry,
            ),
          );
        }
      }
    }

    await Promise.all(
      Array.from(
        { length: Math.min(CONCURRENCY, pending.length) },
        () => worker(),
      ),
    );

    const entries: GalleryBatchEntry[] = [];
    for (const outcome of outcomes.values()) {
      if (outcome.ok && outcome.entry) {
        entries.push(outcome.entry);
      }
    }

    const failures: GalleryBatchFailure[] = [];
    for (const [id, outcome] of outcomes) {
      if (!outcome.ok) {
        const item = items.find((entry) => entry.id === id);
        failures.push({
          name: item?.file.name ?? "file",
          error: outcome.error ?? "Upload failed.",
        });
      }
    }

    if (entries.length > 0) {
      const recordResult = await createGalleryRecordsAction(entries);
      failures.push(...recordResult.failures);
    }

    const failedNames = new Set(failures.map((failure) => failure.name));

    setItems((previous) =>
      previous.map((item) => {
        const outcome = outcomes.get(item.id);
        if (outcome?.ok) {
          return failedNames.has(item.file.name)
            ? { ...item, status: "failed", error: "Saved file, record failed." }
            : { ...item, status: "done" };
        }
        return item;
      }),
    );

    setRunning(false);
    router.refresh();
  }

  const processed = items.filter(
    (item) => item.status === "done" || item.status === "failed",
  ).length;
  const progress = items.length > 0 ? Math.round((processed / items.length) * 100) : 0;
  const failures = items.filter((item) => item.status === "failed");

  return (
    <section className="mt-8 rounded-card border border-ink-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-ink-950">
        Upload Gallery Images
      </h2>
      <p className="mt-1 text-sm text-ink-600">
        Select many images at once (JPG, PNG, WebP, AVIF). Up to{" "}
        {GALLERY_BATCH_MAX} per batch. Captions are optional — add them later
        with the caption workflow.
      </p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "mt-4 rounded-card border border-dashed p-8 text-center transition-colors",
          dragging
            ? "border-brand-600 bg-brand-100/40"
            : "border-ink-300 bg-ink-50",
        )}
      >
        <p className="text-sm text-ink-600">
          Drag and drop images here, or
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={buttonStyles("dark", "sm", "mt-3")}
        >
          Choose images
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={GALLERY_IMAGE_ACCEPT}
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm text-ink-600">
            <span>
              {processed} of {items.length} processed
            </span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ul className="mt-4 max-h-64 space-y-1.5 overflow-auto text-sm">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 px-3 py-2"
              >
                <span className="min-w-0 truncate text-ink-700">
                  {item.file.name}{" "}
                  <span className="text-ink-400">
                    ({formatFileSize(item.file.size)})
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 text-xs font-semibold uppercase tracking-wide",
                    item.status === "done" && "text-success-600",
                    item.status === "failed" && "text-brand-600",
                    (item.status === "pending" || item.status === "uploading") &&
                      "text-ink-400",
                  )}
                  title={item.error}
                >
                  {item.status === "done"
                    ? "Uploaded"
                    : item.status === "failed"
                      ? "Failed"
                      : item.status === "uploading"
                        ? "Uploading…"
                        : "Ready"}
                </span>
              </li>
            ))}
          </ul>

          {failures.length > 0 && (
            <div className="mt-4 rounded-lg border border-brand-600/30 bg-brand-100/40 px-4 py-3">
              <p className="text-sm font-semibold text-brand-700">
                {failures.length}{" "}
                {failures.length === 1 ? "image failed" : "images failed"} —
                the rest uploaded successfully.
              </p>
              <ul className="mt-2 space-y-1 text-xs text-brand-700">
                {failures.map((item) => (
                  <li key={item.id}>
                    {item.file.name}: {item.error ?? "Upload failed."}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={upload}
              disabled={running || processed === items.length}
              className={buttonStyles("primary", "md")}
            >
              {running ? "Uploading…" : "Upload Gallery Images"}
            </button>
            {failures.length > 0 && !running && (
              <button
                type="button"
                onClick={retryFailed}
                className={buttonStyles("outline", "md")}
              >
                Retry failed
              </button>
            )}
            <button
              type="button"
              onClick={() => setItems([])}
              disabled={running}
              className={buttonStyles("outline", "md")}
            >
              Clear list
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

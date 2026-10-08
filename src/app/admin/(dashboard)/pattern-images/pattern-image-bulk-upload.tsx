"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatFileSize } from "@/lib/media/format";
import {
  buildPatternImagePath,
  normalizePatternCode,
  planPatternImageFiles,
  PATTERN_IMAGE_ACCEPT,
  PATTERN_IMAGE_BATCH_MAX,
  PATTERN_IMAGE_BUCKET_ID,
  type PatternImageBatchEntry,
  type PatternImageDirectoryEntry,
  type PatternImagePlan,
} from "@/lib/media/pattern-image-batch";
import { validateUpload } from "@/lib/media/upload";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import { commitPatternImagesAction } from "./actions";

type Progress = "idle" | "uploading" | "success" | "failed";

type Item = {
  id: string;
  file: File;
  plan: PatternImagePlan;
  replace: boolean;
  progress: Progress;
  error?: string;
};

type ExistingImage = { patternCode: string; url: string };

const CONCURRENCY = 3;

function progressLabel(item: Item): string {
  if (item.plan.status === "failed") {
    return "Failed";
  }
  if (item.progress === "success") {
    return "Success";
  }
  if (item.progress === "failed") {
    return "Failed";
  }
  if (item.progress === "uploading") {
    return "Uploading";
  }
  if (item.plan.status === "exists" && !item.replace) {
    return "Image already exists";
  }
  return "Ready";
}

/**
 * Admin Pattern Image bulk upload. The filename is the identifier: the client
 * reads the Pattern Code, resolves it against the canonical directory passed
 * from the server and shows the match. The browser uploads each accepted image
 * straight to the dedicated `product-images` bucket, then one server action
 * creates or replaces the single Media record associated with the Pattern.
 */
export function PatternImageBulkUpload({
  directory,
  existing,
}: {
  directory: PatternImageDirectoryEntry[];
  existing: ExistingImage[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);

  const existingCodes = useMemo(
    () =>
      new Set(existing.map((entry) => normalizePatternCode(entry.patternCode))),
    [existing],
  );

  const existingByCode = useMemo(() => {
    const map = new Map<string, ExistingImage>();
    for (const entry of existing) {
      map.set(normalizePatternCode(entry.patternCode), entry);
    }
    return map;
  }, [existing]);

  function addFiles(files: FileList | File[] | null) {
    if (!files) {
      return;
    }

    const incoming = Array.from(files).slice(0, PATTERN_IMAGE_BATCH_MAX);
    const existingNames = items.map((item) => item.file.name);
    const allNames = [...existingNames, ...incoming.map((file) => file.name)];
    const plans = planPatternImageFiles(allNames, directory, existingCodes);

    const next: Item[] = incoming.map((file, index) => ({
      id: crypto.randomUUID(),
      file,
      plan: plans[existingNames.length + index],
      replace: false,
      progress: "idle",
    }));

    setItems((previous) =>
      [...previous, ...next].slice(0, PATTERN_IMAGE_BATCH_MAX),
    );
  }

  function markReplace(id: string) {
    setItems((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, replace: true } : item,
      ),
    );
  }

  async function upload() {
    const pending = items.filter(
      (item) =>
        item.progress !== "success" &&
        (item.plan.status === "ready" ||
          (item.plan.status === "exists" && item.replace)),
    );

    if (pending.length === 0 || running) {
      return;
    }

    setRunning(true);

    let supabase: ReturnType<typeof createSupabaseBrowserClient>;
    try {
      supabase = createSupabaseBrowserClient();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not start the upload.";
      setItems((previous) =>
        previous.map((item) =>
          pending.some((entry) => entry.id === item.id)
            ? { ...item, progress: "failed", error: message }
            : item,
        ),
      );
      setRunning(false);
      return;
    }

    const outcomes = new Map<
      string,
      { ok: boolean; entry?: PatternImageBatchEntry; error?: string }
    >();

    let cursor = 0;
    async function worker() {
      while (cursor < pending.length) {
        const item = pending[cursor];
        cursor += 1;

        setItems((previous) =>
          previous.map((entry) =>
            entry.id === item.id
              ? { ...entry, progress: "uploading", error: undefined }
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
                ? { ...entry, progress: "failed", error: validation.error }
                : entry,
            ),
          );
          continue;
        }

        // The plan already resolved the filename to its canonical Pattern Code.
        const code = item.plan.code;
        if (!code) {
          const message = "Could not read a Pattern Code from the filename.";
          outcomes.set(item.id, { ok: false, error: message });
          setItems((previous) =>
            previous.map((entry) =>
              entry.id === item.id
                ? { ...entry, progress: "failed", error: message }
                : entry,
            ),
          );
          continue;
        }

        const path = buildPatternImagePath(code, item.id, validation.safeName);

        try {
          const upload = await supabase.storage
            .from(PATTERN_IMAGE_BUCKET_ID)
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
              replace: item.replace,
            },
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Upload failed.";
          outcomes.set(item.id, { ok: false, error: message });
          setItems((previous) =>
            previous.map((entry) =>
              entry.id === item.id
                ? { ...entry, progress: "failed", error: message }
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

    const entries: PatternImageBatchEntry[] = [];
    for (const outcome of outcomes.values()) {
      if (outcome.ok && outcome.entry) {
        entries.push(outcome.entry);
      }
    }

    const failures: { name: string; error: string }[] = [];
    if (entries.length > 0) {
      try {
        const result = await commitPatternImagesAction(entries);
        failures.push(...result.failures);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not save the image associations.";
        for (const entry of entries) {
          failures.push({ name: entry.name, error: message });
        }
      }
    }

    const failedByPath = new Map(failures.map((failure) => [failure.name, failure.error]));

    setItems((previous) =>
      previous.map((item) => {
        const outcome = outcomes.get(item.id);
        if (!outcome) {
          return item;
        }
        if (!outcome.ok) {
          return { ...item, progress: "failed", error: outcome.error };
        }
        const failure = failedByPath.get(item.file.name);
        return failure
          ? { ...item, progress: "failed", error: failure }
          : { ...item, progress: "success" };
      }),
    );

    setRunning(false);
    router.refresh();
  }

  const uploadable = items.filter(
    (item) =>
      item.progress !== "success" &&
      (item.plan.status === "ready" ||
        (item.plan.status === "exists" && item.replace)),
  );
  const processed = items.filter(
    (item) => item.progress === "success" || item.progress === "failed",
  ).length;
  const failures = items.filter((item) => progressLabel(item) === "Failed");

  return (
    <section className="mt-8 rounded-card border border-ink-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-ink-950">
        Upload Pattern Images
      </h2>
      <p className="mt-1 text-sm text-ink-600">
        The filename is matched to a Pattern Code across every range. Extension,
        case, spaces and separators are ignored, and a trailing{" "}
        <code>+</code> may be written <code>PLUS</code> —{" "}
        <code>fm-06.webp</code> → <code>FM06</code>,{" "}
        <code>fm-601-plus.webp</code> → <code>FM601+</code>. Up to{" "}
        {PATTERN_IMAGE_BATCH_MAX} images per batch. Images are stored in the
        dedicated <code>product-images</code> bucket.
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
        <p className="text-sm text-ink-600">Drag and drop images here, or</p>
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
          accept={PATTERN_IMAGE_ACCEPT}
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
            <span>
              {uploadable.length > 0
                ? `${uploadable.length} ready`
                : "Nothing to upload"}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-2 py-2 font-semibold">Filename</th>
                  <th className="px-2 py-2 font-semibold">Pattern Code</th>
                  <th className="px-2 py-2 font-semibold">Pattern</th>
                  <th className="px-2 py-2 font-semibold">Category</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const label = progressLabel(item);
                  const existingImage = item.plan.code
                    ? existingByCode.get(item.plan.code)
                    : undefined;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-ink-100 align-top"
                    >
                      <td className="px-2 py-2.5 text-ink-700">
                        {item.file.name}
                        <span className="block text-xs text-ink-400">
                          {formatFileSize(item.file.size)}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 font-medium text-ink-900">
                        {item.plan.code ?? "—"}
                      </td>
                      <td className="px-2 py-2.5 text-ink-700">
                        {item.plan.entry?.displayName ?? "Pattern not found"}
                      </td>
                      <td className="px-2 py-2.5 text-ink-700">
                        {item.plan.entry?.categoryName ?? "—"}
                      </td>
                      <td className="px-2 py-2.5">
                        <span
                          className={cn(
                            "font-semibold",
                            label === "Success" && "text-success-600",
                            (label === "Failed" || label === "Image already exists") &&
                              "text-accent-700",
                            (label === "Ready" || label === "Uploading") &&
                              "text-ink-500",
                          )}
                        >
                          {label}
                        </span>
                        {item.error && item.plan.status !== "failed" && label === "Failed" && (
                          <span className="block text-xs text-ink-500">
                            {item.error}
                          </span>
                        )}
                        {item.plan.status === "failed" && item.plan.reason && (
                          <span className="block text-xs text-ink-500">
                            {item.plan.reason}
                          </span>
                        )}
                        {item.plan.status === "exists" && !item.replace && (
                          <span className="mt-1 flex items-center gap-2">
                            {existingImage && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={existingImage.url}
                                alt=""
                                className="h-8 w-8 rounded border border-ink-200 object-contain"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => markReplace(item.id)}
                              className={buttonStyles("outline", "sm")}
                            >
                              Replace
                            </button>
                          </span>
                        )}
                        {item.plan.status === "exists" && item.replace && (
                          <span className="block text-xs text-ink-500">
                            Will replace the existing image
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {failures.length > 0 && (
            <div className="mt-4 rounded-lg border border-accent-500/40 bg-accent-500/10 px-4 py-3">
              <p className="text-sm font-semibold text-accent-700">
                {failures.length}{" "}
                {failures.length === 1 ? "image failed" : "images failed"} — the
                rest were saved.
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={upload}
              disabled={running || uploadable.length === 0}
              className={buttonStyles("primary", "md")}
            >
              {running ? "Uploading…" : "Upload Pattern Images"}
            </button>
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

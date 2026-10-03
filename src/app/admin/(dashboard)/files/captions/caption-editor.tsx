"use client";

import Link from "next/link";
import { useActionState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { fieldClass, fieldLabelClass } from "@/components/ui/form";
import { CAPTION_MAX_LENGTH } from "@/lib/media/metadata";

import { saveCaptionAction, type CaptionActionState } from "../actions";

const INITIAL_STATE: CaptionActionState = { status: "idle" };

export type CaptionEditorMedia = {
  id: string;
  url: string;
  path: string;
  type: string;
  caption: string | null;
};

/**
 * The one-image-at-a-time caption editor. Saving stores the caption and the
 * server action redirects straight to the next image that still needs one, so
 * processing a large batch never returns to a list in between.
 */
export function CaptionEditor({
  media,
  category,
  remaining,
  nextHref,
}: {
  media: CaptionEditorMedia;
  category: string;
  remaining: number;
  nextHref: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    saveCaptionAction,
    INITIAL_STATE,
  );
  const fileName = media.path.split("/").pop() ?? media.path;

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="mediaId" value={media.id} />
      <input type="hidden" name="category" value={category} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-card border border-ink-200 bg-ink-100">
          {media.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.url}
              alt=""
              className="max-h-[32rem] w-full object-contain"
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-ink-500">
              Preview not available for {media.type} files.
            </div>
          )}
        </div>

        <div className="rounded-card border border-ink-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Filename
          </p>
          <p className="mt-1 break-all text-sm font-medium text-ink-900">
            {fileName}
          </p>

          <div className="mt-5">
            <label htmlFor="caption" className={fieldLabelClass}>
              Caption
            </label>
            <textarea
              id="caption"
              name="caption"
              defaultValue={media.caption ?? ""}
              maxLength={CAPTION_MAX_LENGTH}
              rows={4}
              autoFocus
              className={fieldClass}
              placeholder="Describe this image for the public Gallery"
            />
            <p className="mt-2 text-xs text-ink-400">
              {remaining}{" "}
              {remaining === 1 ? "image still needs" : "images still need"} a
              caption. Saving moves to the next one.
            </p>
          </div>

          {state.status === "error" && (
            <p role="alert" className="mt-3 text-sm font-medium text-brand-600">
              {state.message}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className={buttonStyles("primary", "md")}
            >
              {pending ? "Saving…" : "Save & next"}
            </button>
            {nextHref && (
              <Link href={nextHref} className={buttonStyles("outline", "md")}>
                Skip
              </Link>
            )}
            <Link
              href={`/admin/media?category=${category}`}
              className={buttonStyles("outline", "md")}
            >
              Back to Files
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}

"use client";

import Image from "next/image";
import { useActionState, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { compactFieldClass as FIELD_CLASS } from "@/components/ui/form";
import { CATEGORIES } from "@/lib/catalogue/categories";
import { INITIAL_MEDIA_ACTION_STATE } from "@/lib/media/action-state";
import type { Media } from "@/lib/media/types";

import { deleteMediaAction, setMediaHiddenAction, updateMediaAction } from "./actions";

export function MediaCard({
  media,
  canEdit,
  canDelete,
  canHide,
}: {
  media: Media;
  canEdit: boolean;
  canDelete: boolean;
  canHide: boolean;
}) {
  const [updateState, updateAction, updating] = useActionState(
    updateMediaAction,
    INITIAL_MEDIA_ACTION_STATE,
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteMediaAction,
    INITIAL_MEDIA_ACTION_STATE,
  );
  const [hideState, hideAction, hiding] = useActionState(
    setMediaHiddenAction,
    INITIAL_MEDIA_ACTION_STATE,
  );
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const fileName = media.path.split("/").pop() ?? media.path;
  const tagged = [media.patternCode, media.categorySlug]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-ink-200 bg-white">
      <div className="relative aspect-[4/3] bg-ink-100">
        {media.type === "image" ? (
          <Image
            src={media.url}
            alt={media.alt ?? ""}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
              {media.type === "video" ? "Video" : "Document"}
            </span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-ink-950/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
          {media.type}
        </span>
        {media.hidden && (
          <span className="absolute right-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
            Hidden
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm font-semibold text-ink-950">
          {media.caption ?? fileName}
        </p>
        <p className="mt-1 text-xs text-ink-500">
          {media.alt ? `Alt: ${media.alt}` : "No alt text supplied"}
        </p>

        <dl className="mt-3 space-y-1 text-xs text-ink-500">
          <div className="flex justify-between gap-3">
            <dt>Bucket</dt>
            <dd className="font-medium text-ink-700">{media.bucket}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Path</dt>
            <dd className="truncate font-medium text-ink-700" title={media.path}>
              {media.path}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Added</dt>
            <dd className="font-medium text-ink-700">
              {media.createdAt.slice(0, 10)}
            </dd>
          </div>
          {tagged && (
            <div className="flex justify-between gap-3">
              <dt>Tagged</dt>
              <dd className="font-medium text-ink-700">{tagged}</dd>
            </div>
          )}
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => setEditing((open) => !open)}
              className={buttonStyles("outline", "sm")}
            >
              {editing ? "Close" : "Edit details"}
            </button>
          )}

          {canHide && (
            <form action={hideAction}>
              <input type="hidden" name="mediaId" value={media.id} />
              <input
                type="hidden"
                name="hidden"
                value={media.hidden ? "false" : "true"}
              />
              <button
                type="submit"
                disabled={hiding}
                className={buttonStyles("outline", "sm")}
              >
                {hiding
                  ? "Saving…"
                  : media.hidden
                    ? "Reveal"
                    : "Hide"}
              </button>
            </form>
          )}

          {canDelete &&
            (confirming ? (
              <>
                <form action={deleteAction}>
                  <input type="hidden" name="mediaId" value={media.id} />
                  <button
                    type="submit"
                    disabled={deleting}
                    className={buttonStyles("accent", "sm")}
                  >
                    {deleting ? "Deleting…" : "Confirm delete"}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className={buttonStyles("outline", "sm")}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className={buttonStyles("outline", "sm")}
              >
                Delete
              </button>
            ))}
        </div>

        {canEdit && editing && (
          <form
            action={updateAction}
            className="mt-4 space-y-3 border-t border-ink-100 pt-4"
          >
            <input type="hidden" name="mediaId" value={media.id} />

            <div>
              <label htmlFor={`alt-${media.id}`} className="text-xs font-medium text-ink-700">
                Alt text
              </label>
              <input
                id={`alt-${media.id}`}
                name="alt"
                defaultValue={media.alt ?? ""}
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label htmlFor={`caption-${media.id}`} className="text-xs font-medium text-ink-700">
                Caption
              </label>
              <input
                id={`caption-${media.id}`}
                name="caption"
                defaultValue={media.caption ?? ""}
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label htmlFor={`pattern-${media.id}`} className="text-xs font-medium text-ink-700">
                Pattern code
              </label>
              <input
                id={`pattern-${media.id}`}
                name="patternCode"
                defaultValue={media.patternCode ?? ""}
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label htmlFor={`category-${media.id}`} className="text-xs font-medium text-ink-700">
                Category
              </label>
              <select
                id={`category-${media.id}`}
                name="categorySlug"
                defaultValue={media.categorySlug ?? ""}
                className={FIELD_CLASS}
              >
                <option value="">No category</option>
                {CATEGORIES.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.displayName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={updating}
              className={buttonStyles("primary", "sm")}
            >
              {updating ? "Saving…" : "Save details"}
            </button>
          </form>
        )}

        {updateState.status === "success" && (
          <p role="status" className="mt-3 text-xs font-medium text-success-600">
            {updateState.message}
          </p>
        )}
        {updateState.status === "error" && (
          <p role="alert" className="mt-3 text-xs font-medium text-brand-600">
            {updateState.message}
          </p>
        )}
        {deleteState.status === "error" && (
          <p role="alert" className="mt-3 text-xs font-medium text-brand-600">
            {deleteState.message}
          </p>
        )}
        {hideState.status === "success" && (
          <p role="status" className="mt-3 text-xs font-medium text-success-600">
            {hideState.message}
          </p>
        )}
        {hideState.status === "error" && (
          <p role="alert" className="mt-3 text-xs font-medium text-brand-600">
            {hideState.message}
          </p>
        )}
      </div>
    </article>
  );
}

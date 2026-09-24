"use client";

import { useActionState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { INITIAL_POST_ACTION_STATE } from "@/lib/blog/action-state";
import type { PostStatus } from "@/lib/blog/post";

import { deletePostAction, setPostStatusAction } from "./actions";

export function PostActions({
  postId,
  status,
  canDelete,
}: {
  postId: string;
  status: PostStatus;
  canDelete: boolean;
}) {
  const [statusState, statusAction, statusPending] = useActionState(
    setPostStatusAction,
    INITIAL_POST_ACTION_STATE,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePostAction,
    INITIAL_POST_ACTION_STATE,
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form action={statusAction}>
        <input type="hidden" name="postId" value={postId} />
        <input
          type="hidden"
          name="status"
          value={status === "published" ? "draft" : "published"}
        />
        <button
          type="submit"
          disabled={statusPending}
          className={buttonStyles(status === "published" ? "outline" : "accent", "md")}
        >
          {statusPending
            ? "Saving…"
            : status === "published"
              ? "Unpublish"
              : "Publish"}
        </button>
      </form>

      {canDelete && (
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!window.confirm("Delete this post? This cannot be undone.")) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="postId" value={postId} />
          <button
            type="submit"
            disabled={deletePending}
            className={buttonStyles("outline", "md")}
          >
            {deletePending ? "Deleting…" : "Delete"}
          </button>
        </form>
      )}

      {statusState.status === "error" && (
        <p role="alert" className="text-sm font-medium text-brand-600">
          {statusState.message}
        </p>
      )}
      {deleteState.status === "error" && (
        <p role="alert" className="text-sm font-medium text-brand-600">
          {deleteState.message}
        </p>
      )}
    </div>
  );
}

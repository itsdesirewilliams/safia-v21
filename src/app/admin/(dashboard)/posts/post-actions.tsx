"use client";

import { useActionState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { INITIAL_POST_ACTION_STATE } from "@/lib/blog/action-state";

import { deletePostAction } from "./actions";

/** Post-header actions. Publishing is handled by the editor itself. */
export function PostActions({
  postId,
  canDelete,
}: {
  postId: string;
  canDelete: boolean;
}) {
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePostAction,
    INITIAL_POST_ACTION_STATE,
  );

  if (!canDelete) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
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

      {deleteState.status === "error" && (
        <p role="alert" className="text-sm font-medium text-brand-600">
          {deleteState.message}
        </p>
      )}
    </div>
  );
}

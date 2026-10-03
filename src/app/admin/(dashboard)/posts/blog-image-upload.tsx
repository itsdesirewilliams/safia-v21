"use client";

import { useActionState, useEffect, useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { INITIAL_POST_ACTION_STATE } from "@/lib/blog/action-state";
import { UPLOAD_ACCEPT } from "@/lib/media/upload";

import { uploadBlogImageAction } from "./actions";

/**
 * A small uploader for post imagery, available to every post role including
 * copywriter. It always writes to the `blog-images` bucket.
 */
export function BlogImageUpload() {
  const [state, formAction, pending] = useActionState(
    uploadBlogImageAction,
    INITIAL_POST_ACTION_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 flex flex-wrap items-center gap-3 rounded-card border border-ink-200 bg-white p-4"
    >
      <div className="min-w-[14rem] flex-1">
        <label htmlFor="blog-image" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
          Blog image
        </label>
        <input
          id="blog-image"
          name="file"
          type="file"
          accept={UPLOAD_ACCEPT}
          required
          className="mt-1.5 block w-full text-sm text-ink-600 file:mr-3 file:rounded-lg file:border-0 file:bg-ink-950 file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ink-800"
        />
      </div>
      <button type="submit" disabled={pending} className={buttonStyles("dark", "md")}>
        {pending ? "Uploading…" : "Upload image"}
      </button>
      {state.status === "success" && (
        <p role="status" className="text-sm font-medium text-success-600">
          {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-sm font-medium text-accent-700">
          {state.message}
        </p>
      )}
    </form>
  );
}

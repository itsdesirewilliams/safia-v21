"use client";

import { useActionState, useEffect, useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { fieldClass as FIELD_CLASS, fieldLabelClass as LABEL_CLASS } from "@/components/ui/form";
import { CATEGORIES } from "@/lib/catalogue/categories";
import { INITIAL_MEDIA_ACTION_STATE } from "@/lib/media/action-state";
import { UPLOAD_ACCEPT } from "@/lib/media/upload";
import { STORAGE_BUCKETS } from "@/lib/supabase/buckets";

import { uploadMediaAction } from "./actions";

export function MediaUploadForm() {
  const [state, formAction, isPending] = useActionState(
    uploadMediaAction,
    INITIAL_MEDIA_ACTION_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <section className="mt-8 rounded-card border border-ink-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-ink-950">Upload media</h2>
      <p className="mt-1 text-sm text-ink-600">
        Images up to 10&nbsp;MB, videos up to 200&nbsp;MB, PDFs up to 25&nbsp;MB.
        Alt text is accessibility metadata — describe the content rather than
        repeating the file name.
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="mt-5 grid gap-4 sm:grid-cols-2"
      >
        <div>
          <label htmlFor="upload-bucket" className={LABEL_CLASS}>
            Bucket
          </label>
          <select
            id="upload-bucket"
            name="bucket"
            required
            defaultValue="gallery"
            className={FIELD_CLASS}
          >
            {STORAGE_BUCKETS.map((bucket) => (
              <option key={bucket.id} value={bucket.id}>
                {bucket.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="upload-file" className={LABEL_CLASS}>
            File
          </label>
          <input
            id="upload-file"
            name="file"
            type="file"
            required
            accept={UPLOAD_ACCEPT}
            className="mt-1.5 block w-full rounded-xl border border-ink-200 bg-white text-sm text-ink-600 file:mr-3 file:rounded-full file:border-0 file:bg-ink-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ink-800"
          />
        </div>

        <div>
          <label htmlFor="upload-alt" className={LABEL_CLASS}>
            Alt text (accessibility)
          </label>
          <input
            id="upload-alt"
            name="alt"
            className={FIELD_CLASS}
            placeholder="Describe the image for screen readers"
          />
        </div>

        <div>
          <label htmlFor="upload-caption" className={LABEL_CLASS}>
            Caption
          </label>
          <input id="upload-caption" name="caption" className={FIELD_CLASS} />
        </div>

        <div>
          <label htmlFor="upload-pattern" className={LABEL_CLASS}>
            Pattern code (optional)
          </label>
          <input
            id="upload-pattern"
            name="patternCode"
            className={FIELD_CLASS}
            placeholder="e.g. TR-1042"
          />
        </div>

        <div>
          <label htmlFor="upload-category" className={LABEL_CLASS}>
            Category (optional)
          </label>
          <select
            id="upload-category"
            name="categorySlug"
            defaultValue=""
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

        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className={buttonStyles("primary", "md")}
          >
            {isPending ? "Uploading…" : "Upload"}
          </button>
          {state.status === "success" && (
            <p role="status" className="text-sm font-medium text-success-600">
              {state.message}
            </p>
          )}
          {state.status === "error" && (
            <p role="alert" className="text-sm font-medium text-brand-600">
              {state.message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

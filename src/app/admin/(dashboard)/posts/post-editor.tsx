"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ImageDropzone } from "@/components/admin/blog/image-dropzone";
import { PostPreview } from "@/components/admin/blog/post-preview";
import { TiptapBodyEditor } from "@/components/admin/blog/tiptap-editor";
import { buttonStyles } from "@/components/ui/button";
import { fieldClass, fieldLabelClass } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import { CATEGORIES } from "@/lib/catalogue/categories";
import { toEditorBlocks, type PostBlock } from "@/lib/blog/blocks";
import type { PostEditorPayload } from "@/lib/blog/editor";
import {
  META_DESCRIPTION_RECOMMENDED,
  postSlugFromTitle,
  type PostStatus,
} from "@/lib/blog/post";
import type { Media } from "@/lib/media/types";

import {
  checkSlugAction,
  publishPostAction,
  savePostDraftAction,
  unpublishPostAction,
} from "./actions";

export type PostEditorDefaults = {
  title: string;
  slug: string;
  author: string;
  excerpt: string;
  category: string;
  thumbnailMediaId: string | null;
  seoTitle: string;
  seoDescription: string;
  ogMediaId: string | null;
  body: PostBlock[];
  status: PostStatus;
  publishedSlug: string | null;
};

export type PostEditorProps = {
  mode: "create" | "edit";
  postId?: string;
  mediaLibrary: readonly Media[];
  defaults: PostEditorDefaults;
};

function saveLabel(
  saving: boolean,
  dirty: boolean,
  lastSaved: Date | null,
  failed: boolean,
): string {
  if (saving) return "Saving…";
  if (failed) return "Save failed";
  if (dirty) return "Unsaved changes";
  if (lastSaved) {
    return `Saved ${lastSaved.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  return "All changes saved";
}

export function PostEditor({
  mode,
  postId: initialPostId,
  mediaLibrary,
  defaults,
}: PostEditorProps) {
  const [postId, setPostId] = useState<string | null>(initialPostId ?? null);
  const [status, setStatus] = useState<PostStatus>(defaults.status);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(
    defaults.publishedSlug,
  );
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [library, setLibrary] = useState<Media[]>([...mediaLibrary]);
  const [blocks, setBlocks] = useState<PostBlock[]>(() =>
    toEditorBlocks(defaults.body),
  );
  const [fields, setFields] = useState({
    title: defaults.title,
    slug: defaults.slug,
    author: defaults.author,
    excerpt: defaults.excerpt,
    category: defaults.category,
    seoTitle: defaults.seoTitle,
    seoDescription: defaults.seoDescription,
    thumbnailMediaId: defaults.thumbnailMediaId,
    ogMediaId: defaults.ogMediaId,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults.slug));
  const [slugCheckResult, setSlugCheckResult] = useState<{
    slug: string;
    state: "available" | "taken" | "invalid";
  } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    mode === "edit" ? new Date() : null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const postIdRef = useRef(postId);
  const payloadRef = useRef<PostEditorPayload | null>(null);
  const savingRef = useRef(false);
  const dirtyRef = useRef(false);
  const revisionRef = useRef(0);
  const slugTouchedRef = useRef(slugTouched);

  useEffect(() => {
    postIdRef.current = postId;
  }, [postId]);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    slugTouchedRef.current = slugTouched;
  }, [slugTouched]);

  const payload: PostEditorPayload = {
    ...fields,
    body: blocks,
    previousSlug: publishedSlug,
  };

  useEffect(() => {
    payloadRef.current = payload;
  });

  const markDirty = useCallback(() => {
    revisionRef.current += 1;
    dirtyRef.current = true;
    setDirty(true);
    setSaveFailed(false);
  }, []);

  const setField = useCallback(
    <K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) => {
      setFields((current) => ({ ...current, [key]: value }));
      markDirty();
    },
    [markDirty],
  );

  const setTitle = useCallback(
    (value: string) => {
      setFields((current) => ({
        ...current,
        title: value,
        ...(slugTouchedRef.current ? {} : { slug: postSlugFromTitle(value) }),
      }));
      markDirty();
    },
    [markDirty],
  );

  const setSlug = useCallback(
    (value: string) => {
      const next = value.toLowerCase().replace(/\s+/g, "-");
      const touched = next.trim() !== "";
      slugTouchedRef.current = touched;
      setSlugTouched(touched);
      setFields((current) => ({ ...current, slug: next }));
      markDirty();
    },
    [markDirty],
  );

  const updateBody = useCallback(
    (nextBlocks: PostBlock[]) => {
      setBlocks(nextBlocks);
      markDirty();
    },
    [markDirty],
  );

  const addMedia = useCallback((media: Media) => {
    setLibrary((current) =>
      current.some((entry) => entry.id === media.id)
        ? current
        : [media, ...current],
    );
  }, []);

  const saveDraft = useCallback(async (silent = false) => {
    if (savingRef.current || !payloadRef.current) return;
    const revision = revisionRef.current;
    savingRef.current = true;
    setSaving(true);
    setSaveFailed(false);
    if (!silent) setMessage(null);

    const result = await savePostDraftAction(
      payloadRef.current,
      postIdRef.current,
    );

    savingRef.current = false;
    setSaving(false);

    if (!result.ok) {
      setSaveFailed(true);
      setMessage(result.message);
      setErrors(result.errors ?? {});
      return;
    }

    const wasNew = !postIdRef.current;
    postIdRef.current = result.postId;
    setPostId(result.postId);
    if (wasNew) {
      window.history.replaceState(
        null,
        "",
        `/admin/posts/${result.postId}/edit`,
      );
    }
    setFields((current) => ({
      ...current,
      slug:
        current.slug || (result.slug.startsWith("draft-") ? "" : result.slug),
    }));
    setStatus(result.status);
    setErrors({});
    setLastSaved(new Date());
    setMessage(silent ? null : result.message);
    if (revisionRef.current === revision) {
      setDirty(false);
      dirtyRef.current = false;
    }
  }, []);

  const publish = useCallback(async () => {
    if (savingRef.current || !payloadRef.current) return;
    if (
      status === "published" &&
      publishedSlug &&
      fields.slug !== publishedSlug
    ) {
      const confirmed = window.confirm(
        "This post is published. Changing its slug changes the live URL. Continue?",
      );
      if (!confirmed) return;
    }

    const revision = revisionRef.current;
    savingRef.current = true;
    setSaving(true);
    setSaveFailed(false);
    setMessage(null);

    const result = await publishPostAction(
      payloadRef.current,
      postIdRef.current,
    );

    savingRef.current = false;
    setSaving(false);

    if (!result.ok) {
      setSaveFailed(true);
      setMessage(result.message);
      setErrors(result.errors ?? {});
      return;
    }

    const wasNew = !postIdRef.current;
    postIdRef.current = result.postId;
    setPostId(result.postId);
    if (wasNew) {
      window.history.replaceState(
        null,
        "",
        `/admin/posts/${result.postId}/edit`,
      );
    }
    setStatus("published");
    setPublishedSlug(result.slug);
    setFields((current) => ({ ...current, slug: result.slug }));
    setErrors({});
    setLastSaved(new Date());
    setMessage(result.message);
    if (revisionRef.current === revision) {
      setDirty(false);
      dirtyRef.current = false;
    }
  }, [fields.slug, publishedSlug, status]);

  const unpublish = useCallback(async () => {
    if (!postIdRef.current || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveFailed(false);
    setMessage(null);
    const result = await unpublishPostAction(postIdRef.current);
    savingRef.current = false;
    setSaving(false);
    if (!result.ok) {
      setSaveFailed(true);
      setMessage(result.message);
      return;
    }
    setStatus("draft");
    setPublishedSlug(null);
    setMessage(result.message);
    setLastSaved(new Date());
  }, []);

  // Autosave drafts after changes; published posts only change on Update.
  useEffect(() => {
    if (status !== "draft") return;
    const timer = window.setInterval(() => {
      if (dirtyRef.current && !savingRef.current) void saveDraft(true);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [status, saveDraft]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!dirtyRef.current) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;
      if (!window.confirm("You have unsaved changes. Leave this page?")) {
        event.preventDefault();
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const slugValue = fields.slug.trim();
  const slugCheckActive =
    Boolean(slugValue) && !slugValue.startsWith("draft-");
  const slugCheck: "idle" | "checking" | "available" | "taken" | "invalid" =
    !slugCheckActive
      ? "idle"
      : slugCheckResult?.slug === slugValue
        ? slugCheckResult.state
        : "checking";

  useEffect(() => {
    if (!slugCheckActive) return;
    const timer = window.setTimeout(async () => {
      const result = await checkSlugAction(slugValue, postIdRef.current);
      setSlugCheckResult({
        slug: slugValue,
        state: !result.ok ? "invalid" : result.available ? "available" : "taken",
      });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [slugValue, slugCheckActive]);

  const cover = fields.thumbnailMediaId
    ? library.find((entry) => entry.id === fields.thumbnailMediaId)
    : undefined;
  const ogImage = fields.ogMediaId
    ? library.find((entry) => entry.id === fields.ogMediaId)
    : undefined;
  const slugWarning =
    status === "published" &&
    publishedSlug !== null &&
    fields.slug !== publishedSlug;

  return (
    <form className="mt-6 space-y-6" onSubmit={(event) => event.preventDefault()}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-ink-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
              status === "published"
                ? "bg-success-600/10 text-success-600"
                : "bg-ink-100 text-ink-600",
            )}
          >
            {status}
          </span>
          <span
            aria-live="polite"
            suppressHydrationWarning
            className={cn(
              "text-sm",
              saveFailed ? "text-brand-600" : "text-ink-500",
            )}
          >
            {saveLabel(saving, dirty, lastSaved, saveFailed)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setView((current) => (current === "edit" ? "preview" : "edit"))
            }
            className={buttonStyles("outline", "sm")}
          >
            {view === "edit" ? "Preview" : "Edit"}
          </button>

          {status === "draft" ? (
            <>
              <button
                type="button"
                onClick={() => void saveDraft(false)}
                disabled={saving}
                className={buttonStyles("outline", "sm")}
              >
                Save draft
              </button>
              <button
                type="button"
                onClick={() => void publish()}
                disabled={saving}
                className={buttonStyles("accent", "sm")}
              >
                Publish
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void publish()}
                disabled={saving}
                className={buttonStyles("primary", "sm")}
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => void unpublish()}
                disabled={saving}
                className={buttonStyles("outline", "sm")}
              >
                Unpublish
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <p
          role={saveFailed ? "alert" : "status"}
          className={cn(
            "rounded-lg border px-4 py-3 text-sm font-medium",
            saveFailed
              ? "border-brand-200 bg-brand-50 text-brand-700"
              : "border-success-600/20 bg-success-600/10 text-success-600",
          )}
        >
          {message}
        </p>
      )}

      {view === "preview" ? (
        <PostPreview
          title={fields.title}
          author={fields.author}
          excerpt={fields.excerpt}
          category={fields.category}
          thumbnailMediaId={fields.thumbnailMediaId}
          blocks={blocks}
          media={library}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <section className="rounded-card border border-ink-200 bg-white p-6">
              <label htmlFor="post-title" className={fieldLabelClass}>
                Title
              </label>
              <input
                id="post-title"
                value={fields.title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Untitled post"
                className="mt-2 w-full rounded-lg border border-ink-200 bg-white px-3 py-3 text-2xl font-semibold text-ink-950 outline-none transition placeholder:text-ink-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15"
              />
              <p className="mt-2 text-xs text-ink-500">
                The title is the page H1. Use the editor&apos;s heading menu for
                H1–H6 in the body.
              </p>
              {errors.title && (
                <p role="alert" className="mt-2 text-sm font-semibold text-brand-600">
                  {errors.title}
                </p>
              )}

              <div className="mt-5">
                <label htmlFor="post-slug" className={fieldLabelClass}>
                  Slug
                </label>
                <div className="mt-1.5 flex items-center rounded-lg border border-ink-200 bg-white focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-500/15">
                  <span className="pl-3 text-sm text-ink-400">/blogs/</span>
                  <input
                    id="post-slug"
                    value={fields.slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="auto-generated-from-title"
                    className="w-full rounded-r-lg bg-transparent px-1 py-2.5 text-sm text-ink-900 outline-none"
                  />
                </div>
                <p className="mt-1 text-xs text-ink-500" aria-live="polite">
                  {slugCheck === "checking" && "Checking availability…"}
                  {slugCheck === "available" && "This slug is available."}
                  {slugCheck === "taken" && (
                    <span className="font-semibold text-brand-600">
                      That slug is already in use.
                    </span>
                  )}
                  {slugCheck === "invalid" && (
                    <span className="font-semibold text-brand-600">
                      Use lowercase letters, numbers and dashes only.
                    </span>
                  )}
                  {slugCheck === "idle" && "Leave blank to generate from the title."}
                </p>
                {slugWarning && (
                  <p role="alert" className="mt-1 text-xs font-semibold text-brand-600">
                    This post is published. Changing the slug changes the live URL.
                  </p>
                )}
                {errors.slug && (
                  <p role="alert" className="mt-1 text-xs font-semibold text-brand-600">
                    {errors.slug}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-card border border-ink-200 bg-white p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink-950">Body</h2>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-500">
                    Paste a complete article from anywhere. Use Enter for a new
                    paragraph and Shift + Enter for a line break inside the same
                    paragraph.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <TiptapBodyEditor
                  initialBlocks={blocks}
                  media={library}
                  onMediaUploaded={addMedia}
                  onChange={updateBody}
                />
              </div>

              {errors.body && (
                <p role="alert" className="mt-2 text-sm font-semibold text-brand-600">
                  {errors.body}
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-card border border-ink-200 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-500">
                Post settings
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="post-category" className={fieldLabelClass}>
                    Category (optional)
                  </label>
                  <select
                    id="post-category"
                    value={fields.category}
                    onChange={(event) => setField("category", event.target.value)}
                    className={fieldClass}
                  >
                    <option value="">No category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.displayName}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p role="alert" className="mt-1 text-xs font-semibold text-brand-600">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="post-author" className={fieldLabelClass}>
                    Author
                  </label>
                  <input
                    id="post-author"
                    value={fields.author}
                    onChange={(event) => setField("author", event.target.value)}
                    placeholder="Safeway Tyre"
                    className={fieldClass}
                  />
                  <p className="mt-1 text-xs text-ink-500">
                    Drafts may omit this; publishing uses “Safeway Tyre” if blank.
                  </p>
                </div>

                <div>
                  <label htmlFor="post-excerpt" className={fieldLabelClass}>
                    Excerpt
                  </label>
                  <textarea
                    id="post-excerpt"
                    value={fields.excerpt}
                    onChange={(event) => setField("excerpt", event.target.value)}
                    rows={3}
                    className={fieldClass}
                    placeholder="A short summary for the blog listing."
                  />
                  {errors.excerpt && (
                    <p role="alert" className="mt-1 text-xs font-semibold text-brand-600">
                      {errors.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-card border border-ink-200 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-500">
                Cover image
              </h2>
              <div className="mt-4">
                <ImageDropzone
                  value={{
                    mediaId: fields.thumbnailMediaId,
                    url: cover?.url ?? null,
                    alt: cover?.alt ?? null,
                  }}
                  onChange={(value) =>
                    setField("thumbnailMediaId", value.mediaId)
                  }
                  media={library}
                  onMediaUploaded={addMedia}
                  label="Cover image"
                  aspect="aspect-[16/9]"
                  uploadAlt={fields.title || "Blog cover image"}
                />
              </div>
            </section>

            <section className="rounded-card border border-ink-200 bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-500">
                Search &amp; social
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="post-seo-title" className={fieldLabelClass}>
                    SEO title
                  </label>
                  <input
                    id="post-seo-title"
                    value={fields.seoTitle}
                    onChange={(event) => setField("seoTitle", event.target.value)}
                    maxLength={120}
                    className={fieldClass}
                    placeholder="Defaults to the post title"
                  />
                  <p className="mt-1 text-xs text-ink-500">
                    {fields.seoTitle.length}/120 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="post-seo-description" className={fieldLabelClass}>
                    Meta description
                  </label>
                  <textarea
                    id="post-seo-description"
                    value={fields.seoDescription}
                    onChange={(event) =>
                      setField("seoDescription", event.target.value)
                    }
                    maxLength={320}
                    rows={3}
                    className={fieldClass}
                    placeholder="Defaults to the excerpt"
                  />
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      fields.seoDescription.length > META_DESCRIPTION_RECOMMENDED
                        ? "font-semibold text-brand-600"
                        : "text-ink-500",
                    )}
                  >
                    {fields.seoDescription.length}/{META_DESCRIPTION_RECOMMENDED}
                    {fields.seoDescription.length > META_DESCRIPTION_RECOMMENDED
                      ? " — longer than recommended"
                      : ""}
                  </p>
                  {errors.seoDescription && (
                    <p role="alert" className="mt-1 text-xs font-semibold text-brand-600">
                      {errors.seoDescription}
                    </p>
                  )}
                </div>

                <div>
                  <span className={fieldLabelClass}>Social-sharing image</span>
                  <div className="mt-1.5">
                    <ImageDropzone
                      value={{
                        mediaId: fields.ogMediaId,
                        url: ogImage?.url ?? null,
                        alt: ogImage?.alt ?? null,
                      }}
                      onChange={(value) => setField("ogMediaId", value.mediaId)}
                      media={library}
                      onMediaUploaded={addMedia}
                      label="Social image"
                      aspect="aspect-[1.91/1]"
                    />
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}
    </form>
  );
}

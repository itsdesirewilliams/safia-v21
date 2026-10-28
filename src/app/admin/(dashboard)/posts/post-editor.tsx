"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
} from "react";

import { BlockEditor } from "@/components/admin/blog/block-editors";
import { ImageDropzone } from "@/components/admin/blog/image-dropzone";
import { InsertBlockMenu } from "@/components/admin/blog/insert-block-menu";
import { PostPreview } from "@/components/admin/blog/post-preview";
import { buttonStyles } from "@/components/ui/button";
import { fieldClass, fieldLabelClass } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import { CATEGORIES } from "@/lib/catalogue/categories";
import {
  BLOCK_TYPE_OPTIONS,
  type BlockComponent,
} from "@/lib/blog/block-library";
import { toEditorBlocks, type PostBlock } from "@/lib/blog/blocks";
import type { PostEditorPayload } from "@/lib/blog/editor";
import {
  META_DESCRIPTION_RECOMMENDED,
  postSlugFromTitle,
  type PostStatus,
} from "@/lib/blog/post";
import { parsePastedTable } from "@/lib/blog/table-paste";
import type { Media } from "@/lib/media/types";

import {
  checkSlugAction,
  publishPostAction,
  savePostDraftAction,
  unpublishPostAction,
} from "./actions";

type EditorBlock = { key: string; block: PostBlock };

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

let blockCounter = 0;

function newKey(): string {
  blockCounter += 1;
  return `block-${Date.now().toString(36)}-${blockCounter}`;
}

function cloneBlock(block: PostBlock): PostBlock {
  return JSON.parse(JSON.stringify(block)) as PostBlock;
}

function blockLabel(block: PostBlock): string {
  return (
    BLOCK_TYPE_OPTIONS.find((option) => option.type === block.type)?.label ??
    block.type
  );
}

function saveLabel(
  saving: boolean,
  dirty: boolean,
  lastSaved: Date | null,
  failed: boolean,
): string {
  if (saving) {
    return "Saving…";
  }
  if (failed) {
    return "Save failed";
  }
  if (dirty) {
    return "Unsaved changes";
  }
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
  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    toEditorBlocks(defaults.body).map((block) => ({ key: newKey(), block })),
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
  const activeBlockRef = useRef<string | null>(null);
  const blockRefs = useRef(new Map<string, HTMLElement>());

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
    body: blocks.map((entry) => entry.block),
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
        ...(slugTouchedRef.current
          ? {}
          : { slug: postSlugFromTitle(value) }),
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

  const scrollToBlock = useCallback((key: string) => {
    window.setTimeout(() => {
      blockRefs.current.get(key)?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 0);
  }, []);

  const updateBlock = useCallback(
    (key: string, block: PostBlock) => {
      setBlocks((current) =>
        current.map((entry) => (entry.key === key ? { ...entry, block } : entry)),
      );
      markDirty();
    },
    [markDirty],
  );

  const insertBlocks = useCallback(
    (index: number, newBlocks: readonly PostBlock[]) => {
      if (newBlocks.length === 0) {
        return;
      }
      const entries = newBlocks.map((block) => ({ key: newKey(), block }));
      setBlocks((current) => {
        const copy = [...current];
        copy.splice(index, 0, ...entries);
        return copy;
      });
      markDirty();
      scrollToBlock(entries[0].key);
    },
    [markDirty, scrollToBlock],
  );

  const duplicateBlock = useCallback(
    (key: string) => {
      setBlocks((current) => {
        const index = current.findIndex((entry) => entry.key === key);
        if (index < 0) {
          return current;
        }
        const entry = { key: newKey(), block: cloneBlock(current[index].block) };
        const copy = [...current];
        copy.splice(index + 1, 0, entry);
        scrollToBlock(entry.key);
        return copy;
      });
      markDirty();
    },
    [markDirty, scrollToBlock],
  );

  const moveBlock = useCallback(
    (key: string, direction: -1 | 1) => {
      setBlocks((current) => {
        const index = current.findIndex((entry) => entry.key === key);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= current.length) {
          return current;
        }
        const copy = [...current];
        const [entry] = copy.splice(index, 1);
        copy.splice(target, 0, entry);
        return copy;
      });
      markDirty();
    },
    [markDirty],
  );

  const removeBlock = useCallback(
    (key: string) => {
      setBlocks((current) => current.filter((entry) => entry.key !== key));
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
    if (savingRef.current || !payloadRef.current) {
      return;
    }
    const revision = revisionRef.current;
    savingRef.current = true;
    setSaving(true);
    setSaveFailed(false);
    if (!silent) {
      setMessage(null);
    }

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
    if (savingRef.current || !payloadRef.current) {
      return;
    }
    if (
      status === "published" &&
      publishedSlug &&
      fields.slug !== publishedSlug
    ) {
      const confirmed = window.confirm(
        "This post is published. Changing its slug changes the live URL. Continue?",
      );
      if (!confirmed) {
        return;
      }
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
    if (!postIdRef.current || savingRef.current) {
      return;
    }
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
    if (status !== "draft") {
      return;
    }
    const timer = window.setInterval(() => {
      if (dirtyRef.current && !savingRef.current) {
        void saveDraft(true);
      }
    }, 7000);
    return () => window.clearInterval(timer);
  }, [status, saveDraft]);

  // Warn about unsaved work when leaving the page.
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Warn before following a link with unsaved changes (client navigation).
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!dirtyRef.current) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) {
        return;
      }
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") {
        return;
      }
      if (!window.confirm("You have unsaved changes. Leave this page?")) {
        event.preventDefault();
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  // Debounced slug availability check. Draft placeholder slugs are skipped.
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
    if (!slugCheckActive) {
      return;
    }
    const timer = window.setTimeout(async () => {
      const result = await checkSlugAction(slugValue, postIdRef.current);
      setSlugCheckResult({
        slug: slugValue,
        state: !result.ok
          ? "invalid"
          : result.available
            ? "available"
            : "taken",
      });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [slugValue, slugCheckActive]);

  function handlePasteCapture(event: ClipboardEvent<HTMLElement>) {
    const table = parsePastedTable({
      html: event.clipboardData.getData("text/html"),
      text: event.clipboardData.getData("text/plain"),
    });
    if (!table) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const activeKey = activeBlockRef.current;
    setBlocks((current) => {
      const index = activeKey
        ? current.findIndex((entry) => entry.key === activeKey)
        : -1;

      if (index >= 0 && current[index].block.type === "table") {
        const copy = [...current];
        copy[index] = {
          ...copy[index],
          block: { type: "table", rows: table },
        };
        return copy;
      }

      const entry = { key: newKey(), block: { type: "table" as const, rows: table } };
      const insertAt = index >= 0 ? index + 1 : current.length;
      const copy = [...current];
      copy.splice(insertAt, 0, entry);
      scrollToBlock(entry.key);
      return copy;
    });
    markDirty();
  }

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
    <form
      className="mt-6 space-y-6"
      onSubmit={(event) => event.preventDefault()}
    >
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
          blocks={blocks.map((entry) => entry.block)}
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
                The title is the page H1. Use H2–H4 inside the body.
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
                  {slugCheck === "idle" &&
                    "Leave blank to generate from the title."}
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

            <section
              className="rounded-card border border-ink-200 bg-white p-4 sm:p-6"
              onPasteCapture={handlePasteCapture}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink-950">Body</h2>
                <InsertBlockMenu
                  onInsertBlock={(block) => insertBlocks(blocks.length, [block])}
                  onInsertComponent={(component: BlockComponent) =>
                    insertBlocks(blocks.length, component.create())
                  }
                  label="Add block"
                />
              </div>

              {blocks.length === 0 ? (
                <p className="mt-5 rounded-lg border border-dashed border-ink-300 bg-ink-50 p-6 text-sm text-ink-600">
                  The body is empty. Insert a text block or a ready-made component
                  to start.
                </p>
              ) : (
                <ol className="mt-4 space-y-2">
                  {blocks.map((entry, index) => (
                    <Fragment key={entry.key}>
                      <li className="py-1">
                        <InsertBlockMenu
                          subtle
                          label="Insert block here"
                          onInsertBlock={(block) => insertBlocks(index, [block])}
                          onInsertComponent={(component: BlockComponent) =>
                            insertBlocks(index, component.create())
                          }
                        />
                      </li>
                      <li
                        ref={(node) => {
                          if (node) {
                            blockRefs.current.set(entry.key, node);
                          } else {
                            blockRefs.current.delete(entry.key);
                          }
                        }}
                        onClick={() => {
                          activeBlockRef.current = entry.key;
                        }}
                        onFocusCapture={() => {
                          activeBlockRef.current = entry.key;
                        }}
                        className="rounded-lg border border-ink-200 bg-ink-50/60 p-3 sm:p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                            {blockLabel(entry.block)}
                          </span>
                          <div className="flex flex-wrap items-center gap-1">
                            <button
                              type="button"
                              onClick={() => duplicateBlock(entry.key)}
                              className="rounded-md px-2 py-1 text-xs font-semibold text-ink-600 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                              aria-label={`Duplicate ${blockLabel(entry.block)} block`}
                            >
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBlock(entry.key, -1)}
                              disabled={index === 0}
                              className="rounded-md px-2 py-1 text-xs font-semibold text-ink-600 hover:bg-white disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                              aria-label={`Move ${blockLabel(entry.block)} block up`}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveBlock(entry.key, 1)}
                              disabled={index === blocks.length - 1}
                              className="rounded-md px-2 py-1 text-xs font-semibold text-ink-600 hover:bg-white disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                              aria-label={`Move ${blockLabel(entry.block)} block down`}
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBlock(entry.key)}
                              className="rounded-md px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                              aria-label={`Delete ${blockLabel(entry.block)} block`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <BlockEditor
                            block={entry.block}
                            onChange={(block) => updateBlock(entry.key, block)}
                            media={library}
                            onMediaUploaded={addMedia}
                          />
                        </div>
                      </li>
                    </Fragment>
                  ))}
                  <li className="py-1">
                    <InsertBlockMenu
                      subtle
                      label="Add block at the end"
                      onInsertBlock={(block) => insertBlocks(blocks.length, [block])}
                      onInsertComponent={(component: BlockComponent) =>
                        insertBlocks(blocks.length, component.create())
                      }
                    />
                  </li>
                </ol>
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
                    {fields.seoDescription.length >
                    META_DESCRIPTION_RECOMMENDED
                      ? " · longer than recommended"
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

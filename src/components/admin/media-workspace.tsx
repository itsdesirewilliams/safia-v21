import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonStyles } from "@/components/ui/button";
import { fieldClass, fieldLabelClass } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import { canDeleteMedia, canManageAdminOnlyMedia } from "@/lib/auth/roles";
import { getCurrentProfile, requireMediaManager } from "@/lib/auth/session";
import {
  FILE_CATEGORIES,
  findFileCategory,
} from "@/lib/media/categories";
import { countMissingCaptions, listMediaWithSizes } from "@/lib/media/library";
import type { LibraryFile } from "@/lib/media/library";
import { parseCaptionFilter } from "@/lib/media/server";
import { MEDIA_TYPES } from "@/lib/media/types";
import {
  isAdminOnlyBucket,
  isQualityFirstBucket,
  STORAGE_BUCKETS,
} from "@/lib/supabase/buckets";

import { FileList } from "@/app/admin/(dashboard)/files/file-list";
import { GalleryBulkUpload } from "@/app/admin/(dashboard)/files/gallery-bulk-upload";
import { MediaCard } from "@/app/admin/(dashboard)/files/media-card";
import { MediaUploadForm } from "@/app/admin/(dashboard)/files/media-upload-form";

export type MediaWorkspaceProps = {
  /** The category this route opens on; a `?category=` param can override. */
  presetCategoryId: string;
  searchParams: Promise<{
    category?: string;
    q?: string;
    type?: string;
    caption?: string;
    view?: string;
  }>;
};

/**
 * The Media management workspace (Gallery, Product Images, Blog Images, Quality
 * First). It reuses the shared Supabase Media layer and the existing upload
 * primitives — no parallel storage system — and renders inside the admin shell.
 */
export async function MediaWorkspace({
  presetCategoryId,
  searchParams,
}: MediaWorkspaceProps) {
  await requireMediaManager();
  const profile = await getCurrentProfile();
  const canDelete = canDeleteMedia(profile?.role ?? null);
  const canManageRestricted = canManageAdminOnlyMedia(profile?.role ?? null);

  const allowedBuckets = STORAGE_BUCKETS.filter(
    (bucket) => canManageRestricted || !isAdminOnlyBucket(bucket.id),
  );
  const allowedCategories = FILE_CATEGORIES.filter(
    (category) =>
      category.buckets === null ||
      canManageRestricted ||
      category.buckets.every((bucket) => !isAdminOnlyBucket(bucket)),
  );

  const params = await searchParams;
  const categoryParam =
    typeof params.category === "string" ? params.category : "";
  const preset = findFileCategory(presetCategoryId);
  const category = categoryParam
    ? allowedCategories.find((entry) => entry.id === categoryParam) ?? preset
    : preset;
  const query = typeof params.q === "string" ? params.q : "";
  const type = typeof params.type === "string" ? params.type : "";
  const caption = parseCaptionFilter(params.caption);
  const view = params.view === "list" ? "list" : "grid";

  let media: LibraryFile[] = [];
  let missingCaptionCount = 0;
  let loadError: string | null = null;

  try {
    [media, missingCaptionCount] = await Promise.all([
      listMediaWithSizes({
        buckets: category.buckets,
        type: type || null,
        search: query || null,
        caption,
      }),
      countMissingCaptions({ buckets: category.buckets }),
    ]);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Could not load the media library.";
  }

  function viewHref(next: "grid" | "list"): string {
    const search = new URLSearchParams({ category: category.id, view: next });
    if (query) search.set("q", query);
    if (type) search.set("type", type);
    if (caption) search.set("caption", caption);
    return `?${search.toString()}`;
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Media"
        title={category.label}
        description={category.description}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Media", href: "/admin/media" },
          { label: category.label },
        ]}
        actions={
          <Link href="/admin/files/captions" className={buttonStyles("outline", "sm")}>
            Caption queue
          </Link>
        }
      />

      {missingCaptionCount > 0 && (
        <div
          role="status"
          className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-accent-500/40 bg-accent-500/10 px-4 py-3 text-sm text-ink-800"
        >
          <span className="font-semibold text-accent-700">
            {missingCaptionCount}{" "}
            {missingCaptionCount === 1 ? "image needs" : "images need"} a caption
          </span>
          <Link
            href={`/admin/files/captions?category=${category.id}&filter=missing`}
            className="font-semibold text-brand-600 hover:underline"
          >
            Caption them
          </Link>
        </div>
      )}

      <MediaUploadForm allowedBuckets={allowedBuckets} />

      {category.id === "gallery" && canManageRestricted && <GalleryBulkUpload />}

      <form method="get" className="mt-8 flex flex-wrap items-end gap-3 rounded-card border border-ink-200 bg-white p-4">
        <input type="hidden" name="category" value={category.id} />
        <input type="hidden" name="view" value={view} />

        <div className="min-w-[12rem] flex-1">
          <label htmlFor="media-search" className={fieldLabelClass}>
            Search
          </label>
          <input
            id="media-search"
            name="q"
            defaultValue={query}
            placeholder="Filename, caption, alt or pattern code"
            className={fieldClass}
          />
        </div>

        <div className="min-w-[9rem]">
          <label htmlFor="media-type" className={fieldLabelClass}>
            Type
          </label>
          <select id="media-type" name="type" defaultValue={type} className={fieldClass}>
            <option value="">All types</option>
            {MEDIA_TYPES.map((mediaType) => (
              <option key={mediaType} value={mediaType}>
                {mediaType}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[10rem]">
          <label htmlFor="media-caption" className={fieldLabelClass}>
            Caption
          </label>
          <select
            id="media-caption"
            name="caption"
            defaultValue={caption ?? ""}
            className={fieldClass}
          >
            <option value="">All</option>
            <option value="missing">Missing caption</option>
            <option value="captioned">Captioned</option>
          </select>
        </div>

        <button type="submit" className={buttonStyles("dark", "md")}>
          Apply
        </button>
        <Link href={`?category=${category.id}`} className={buttonStyles("outline", "md")}>
          Reset
        </Link>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {allowedCategories.map((entry) => {
          const active = entry.id === category.id;
          return (
            <Link
              key={entry.id}
              href={`?category=${entry.id}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900",
              )}
            >
              {entry.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          {media.length} {media.length === 1 ? "item" : "items"}
        </p>
        <div
          role="group"
          aria-label="View"
          className="inline-flex overflow-hidden rounded-lg border border-ink-200"
        >
          {(["grid", "list"] as const).map((option) => (
            <Link
              key={option}
              href={viewHref(option)}
              aria-current={view === option ? "true" : undefined}
              className={cn(
                "px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
                view === option ? "bg-ink-950 text-white" : "text-ink-600 hover:bg-ink-50",
              )}
            >
              {option}
            </Link>
          ))}
        </div>
      </div>

      {loadError && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-brand-600/30 bg-brand-100/40 px-4 py-3 text-sm text-brand-700"
        >
          {loadError}
        </p>
      )}

      {media.length === 0 ? (
        <div className="mt-4 rounded-card border border-dashed border-ink-300 bg-white p-12 text-center text-sm text-ink-600">
          No media to show. Upload a file above to get started.
        </div>
      ) : view === "list" ? (
        <FileList files={media} captionCategory={category.id} />
      ) : (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {media.map((item) => (
            <li key={item.id}>
              <MediaCard
                media={item}
                canEdit={canManageRestricted || !isAdminOnlyBucket(item.bucket)}
                canDelete={canDelete}
                canHide={canDelete && isQualityFirstBucket(item.bucket)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

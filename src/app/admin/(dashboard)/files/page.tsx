import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { fieldClass, fieldLabelClass } from "@/components/ui/form";
import { canDeleteMedia, canManageAdminOnlyMedia } from "@/lib/auth/roles";
import { getCurrentProfile, requireMediaManager } from "@/lib/auth/session";
import {
  FILE_CATEGORIES,
  REPOSITORY_CATEGORY_ID,
  findFileCategory,
} from "@/lib/media/categories";
import { countMissingCaptions, listMediaWithSizes } from "@/lib/media/library";
import type { LibraryFile } from "@/lib/media/library";
import { parseCaptionFilter } from "@/lib/media/server";
import { MEDIA_TYPES } from "@/lib/media/types";
import { cn } from "@/lib/cn";
import { isAdminOnlyBucket, isQualityFirstBucket, STORAGE_BUCKETS } from "@/lib/supabase/buckets";

import { FileList } from "./file-list";
import { GalleryBulkUpload } from "./gallery-bulk-upload";
import { MediaCard } from "./media-card";
import { MediaUploadForm } from "./media-upload-form";
import { RepositoryAssetsPanel } from "./repository-assets-panel";

export const metadata = { title: "Files" };

type FilesSearchParams = {
  category?: string;
  q?: string;
  type?: string;
  caption?: string;
  view?: string;
};

/**
 * Admin → Files: the central interface for Admin-managed media. It reuses the
 * shared Supabase Media layer (no parallel storage), and clearly separates the
 * Admin-managed buckets from the read-only developer/repository assets.
 */
export default async function AdminFilesPage({
  searchParams,
}: {
  searchParams: Promise<FilesSearchParams>;
}) {
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
  const isRepository = categoryParam === REPOSITORY_CATEGORY_ID;
  const category = findFileCategory(categoryParam);
  const query = typeof params.q === "string" ? params.q : "";
  const type = typeof params.type === "string" ? params.type : "";
  const caption = parseCaptionFilter(params.caption);
  const view = params.view === "list" ? "list" : "grid";

  let media: LibraryFile[] = [];
  let missingCaptionCount = 0;
  let loadError: string | null = null;

  if (!isRepository) {
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
  }

  function viewHref(next: "grid" | "list"): string {
    const search = new URLSearchParams({ category: category.id, view: next });
    if (query) search.set("q", query);
    if (type) search.set("type", type);
    if (caption) search.set("caption", caption);
    return `/admin/files?${search.toString()}`;
  }

  return (
    <Container className="py-10">
      <p className="text-eyebrow text-brand-600">Admin</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
        Files
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-600">
        The central place for media. Supabase-managed files (Gallery, Product
        Images, Blog Images, Quality First) are uploaded and managed here. The
        developer/repository assets under{" "}
        <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">
          public/assets
        </code>{" "}
        are listed read-only.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[15rem_1fr]">
        <nav aria-label="File categories">
          <ul className="space-y-1">
            {allowedCategories.map((entry) => {
              const active = !isRepository && entry.id === category.id;
              return (
                <li key={entry.id}>
                  <Link
                    href={`/admin/files?category=${entry.id}`}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-ink-950 text-white"
                        : "text-ink-700 hover:bg-ink-100",
                    )}
                  >
                    {entry.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <Link
                href={`/admin/files?category=${REPOSITORY_CATEGORY_ID}`}
                aria-current={isRepository ? "page" : undefined}
                className={cn(
                  "block rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isRepository
                    ? "bg-ink-950 text-white"
                    : "text-ink-700 hover:bg-ink-100",
                )}
              >
                Repository Assets
              </Link>
            </li>
          </ul>
        </nav>

        <div className="min-w-0">
          {isRepository ? (
            <RepositoryAssetsPanel />
          ) : (
            <>
              {missingCaptionCount > 0 && (
                <div
                  role="status"
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-accent-500/40 bg-accent-500/10 px-4 py-3 text-sm text-ink-800"
                >
                  <span className="font-semibold text-accent-700">
                    {missingCaptionCount}{" "}
                    {missingCaptionCount === 1 ? "image needs" : "images need"} a
                    caption
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

              {category.id === "gallery" && canManageRestricted && (
                <GalleryBulkUpload />
              )}

              <form
                method="get"
                className="mt-8 flex flex-wrap items-end gap-3 rounded-card border border-ink-200 bg-white p-4"
              >
                <input type="hidden" name="category" value={category.id} />
                <input type="hidden" name="view" value={view} />

                <div className="min-w-[12rem] flex-1">
                  <label htmlFor="files-search" className={fieldLabelClass}>
                    Search
                  </label>
                  <input
                    id="files-search"
                    name="q"
                    defaultValue={query}
                    placeholder="Filename, caption, alt or pattern code"
                    className={fieldClass}
                  />
                </div>

                <div className="min-w-[9rem]">
                  <label htmlFor="files-type" className={fieldLabelClass}>
                    Type
                  </label>
                  <select
                    id="files-type"
                    name="type"
                    defaultValue={type}
                    className={fieldClass}
                  >
                    <option value="">All types</option>
                    {MEDIA_TYPES.map((mediaType) => (
                      <option key={mediaType} value={mediaType}>
                        {mediaType}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-[10rem]">
                  <label htmlFor="files-caption" className={fieldLabelClass}>
                    Caption
                  </label>
                  <select
                    id="files-caption"
                    name="caption"
                    defaultValue={caption ?? ""}
                    className={fieldClass}
                  >
                    <option value="">All</option>
                    <option value="missing">Missing Caption</option>
                    <option value="captioned">Captioned</option>
                  </select>
                </div>

                <button type="submit" className={buttonStyles("dark", "md")}>
                  Apply
                </button>
                <Link
                  href={`/admin/files?category=${category.id}`}
                  className={buttonStyles("outline", "md")}
                >
                  Reset
                </Link>
              </form>

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
                        view === option
                          ? "bg-ink-950 text-white"
                          : "text-ink-600 hover:bg-ink-50",
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
                        canEdit={
                          canManageRestricted || !isAdminOnlyBucket(item.bucket)
                        }
                        canDelete={canDelete}
                        canHide={canDelete && isQualityFirstBucket(item.bucket)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
}

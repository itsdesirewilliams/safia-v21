import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { fieldClass, fieldLabelClass } from "@/components/ui/form";
import { canDeleteMedia, canManageAdminOnlyMedia } from "@/lib/auth/roles";
import { getCurrentProfile, requireMediaManager } from "@/lib/auth/session";
import { listMedia, hasMissingCaption } from "@/lib/media/server";
import type { Media } from "@/lib/media/types";
import { MEDIA_TYPES } from "@/lib/media/types";
import {
  isAdminOnlyBucket,
  isQualityFirstBucket,
  STORAGE_BUCKETS,
} from "@/lib/supabase/buckets";

import { MediaCard } from "./media-card";
import { MediaUploadForm } from "./media-upload-form";

export const metadata = { title: "Media" };

type MediaPageSearchParams = {
  q?: string;
  bucket?: string;
  type?: string;
  caption?: string;
};

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<MediaPageSearchParams>;
}) {
  await requireMediaManager();
  const profile = await getCurrentProfile();
  const canDelete = canDeleteMedia(profile?.role ?? null);
  const canManageRestricted = canManageAdminOnlyMedia(profile?.role ?? null);
  const allowedBuckets = STORAGE_BUCKETS.filter(
    (bucket) => canManageRestricted || !isAdminOnlyBucket(bucket.id),
  );

  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const bucket = typeof params.bucket === "string" ? params.bucket : "";
  const type = typeof params.type === "string" ? params.type : "";
  const caption = typeof params.caption === "string" ? params.caption : "";
  const missingCaptionOnly = caption === "missing";

  let media: Media[] = [];
  let loadError: string | null = null;

  try {
    media = await listMedia({
      bucket: bucket || null,
      type: type || null,
      search: query || null,
      missingCaption: missingCaptionOnly,
    });
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load the media library.";
  }

  const missingCaptionCount = media.filter(
    (item) => item.type === "image" && hasMissingCaption(item),
  ).length;

  return (
    <Container className="py-10">
      <p className="text-eyebrow text-brand-600">Media library</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
        Media
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-600">
        Upload and manage the images, videos and documents used across the
        site. Files live in Supabase Storage; the shared Media record holds the
        metadata and optional Pattern/Category association.
      </p>

      <MediaUploadForm allowedBuckets={allowedBuckets} />

      <form
        method="get"
        className="mt-8 flex flex-wrap items-end gap-3 rounded-card border border-ink-200 bg-white p-4"
      >
        <div className="min-w-[12rem] flex-1">
          <label
            htmlFor="media-search"
            className={fieldLabelClass}
          >
            Search
          </label>
          <input
            id="media-search"
            name="q"
            defaultValue={query}
            placeholder="Caption, alt, pattern code or path"
            className={fieldClass}
          />
        </div>

        <div className="min-w-[10rem]">
          <label
            htmlFor="media-bucket"
            className={fieldLabelClass}
          >
            Bucket
          </label>
          <select
            id="media-bucket"
            name="bucket"
            defaultValue={bucket}
            className={fieldClass}
          >
            <option value="">All buckets</option>
            {STORAGE_BUCKETS.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.id}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[8rem]">
          <label
            htmlFor="media-type"
            className={fieldLabelClass}
          >
            Type
          </label>
          <select
            id="media-type"
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

        <label className="flex min-h-[2.75rem] items-center gap-2 text-sm font-medium text-ink-700">
          <input
            type="checkbox"
            name="caption"
            value="missing"
            defaultChecked={missingCaptionOnly}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500/40"
          />
          Missing Caption only
        </label>

        <button type="submit" className={buttonStyles("dark", "md")}>
          Apply
        </button>
        <Link href="/admin/media" className={buttonStyles("outline", "md")}>
          Reset
        </Link>
      </form>

      {loadError && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-brand-600/30 bg-brand-100/40 px-4 py-3 text-sm text-brand-700"
        >
          {loadError}
        </p>
      )}

      {missingCaptionCount > 0 && (
        <div
          role="status"
          className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-accent-500/40 bg-accent-500/10 px-4 py-3 text-sm text-ink-800"
        >
          <span className="font-semibold text-accent-700">
            Missing Caption: {missingCaptionCount}{" "}
            {missingCaptionCount === 1 ? "image needs" : "images need"} a caption
          </span>
          {!missingCaptionOnly && (
            <Link
              href="/admin/media?caption=missing"
              className="font-semibold text-brand-600 hover:underline"
            >
              Show only missing captions
            </Link>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-ink-500">
        {media.length} {media.length === 1 ? "item" : "items"}
      </p>

      {media.length === 0 ? (
        <div className="mt-4 rounded-card border border-dashed border-ink-300 bg-white p-12 text-center text-sm text-ink-600">
          No media to show. Upload a file above to get started.
        </div>
      ) : (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </Container>
  );
}

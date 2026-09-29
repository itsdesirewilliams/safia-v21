import Link from "next/link";

import { Container } from "@/components/ui/container";
import { canManageAdminOnlyMedia } from "@/lib/auth/roles";
import { getCurrentProfile, requireMediaManager } from "@/lib/auth/session";
import { FILE_CATEGORIES, findFileCategory } from "@/lib/media/categories";
import { countMissingCaptions } from "@/lib/media/library";
import {
  getMediaById,
  listMedia,
  type CaptionFilter,
} from "@/lib/media/server";
import { cn } from "@/lib/cn";
import { isAdminOnlyBucket } from "@/lib/supabase/buckets";

import { CaptionEditor } from "./caption-editor";

export const metadata = { title: "Captions" };

type CaptionSearchParams = {
  category?: string;
  filter?: string;
  id?: string;
  done?: string;
};

const FILTERS = [
  { id: "missing", label: "Missing Caption" },
  { id: "captioned", label: "Captioned" },
  { id: "all", label: "All" },
] as const;

function parseFilter(value: unknown): CaptionFilter {
  if (value === "captioned") {
    return "captioned";
  }
  if (value === "all") {
    return null;
  }
  return "missing";
}

/**
 * Admin → Files → Caption workflow. Surfaces the dynamic missing-caption count
 * and steps through images one at a time (save → next), so bulk-uploaded
 * Gallery images can be captioned without returning to the list each time.
 */
export default async function CaptionsPage({
  searchParams,
}: {
  searchParams: Promise<CaptionSearchParams>;
}) {
  await requireMediaManager();
  const profile = await getCurrentProfile();
  const canManageRestricted = canManageAdminOnlyMedia(profile?.role ?? null);

  const params = await searchParams;
  const requestedCategory = findFileCategory(
    typeof params.category === "string" ? params.category : "gallery",
  );
  const category =
    requestedCategory.buckets &&
    !canManageRestricted &&
    requestedCategory.buckets.some((bucket) => isAdminOnlyBucket(bucket))
      ? findFileCategory("all")
      : requestedCategory;

  const filter = parseFilter(params.filter);
  const filterId = filter ?? "all";
  const requestedId =
    typeof params.id === "string" && params.id ? params.id : null;

  const [images, missingCount] = await Promise.all([
    listMedia({
      buckets: category.buckets,
      type: "image",
      caption: filter,
      limit: 240,
    }),
    countMissingCaptions({ buckets: category.buckets }),
  ]);

  const requested = requestedId ? await getMediaById(requestedId) : null;
  const current = requested ?? images[0] ?? null;
  const currentIndex = current
    ? images.findIndex((image) => image.id === current.id)
    : -1;
  const nextImage =
    currentIndex >= 0 ? (images[currentIndex + 1] ?? null) : (images[0] ?? null);

  const nextHref = nextImage
    ? `/admin/files/captions?${new URLSearchParams({
        category: category.id,
        filter: filterId,
        id: nextImage.id,
      }).toString()}`
    : null;

  const visibleCategories = FILE_CATEGORIES.filter(
    (entry) =>
      entry.buckets === null ||
      canManageRestricted ||
      entry.buckets.every((bucket) => !isAdminOnlyBucket(bucket)),
  );

  return (
    <Container className="py-10">
      <p className="text-eyebrow text-brand-600">Admin / Files</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
        Caption workflow
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-600">
        Process images that still need a caption one at a time. Saving stores the
        caption and moves straight to the next image.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {visibleCategories.map((entry) => (
          <Link
            key={entry.id}
            href={`/admin/files/captions?category=${entry.id}&filter=${filterId}`}
            aria-current={entry.id === category.id ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              entry.id === category.id
                ? "bg-ink-950 text-white"
                : "text-ink-600 hover:bg-ink-100",
            )}
          >
            {entry.label}
          </Link>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {FILTERS.map((entry) => (
          <Link
            key={entry.id}
            href={`/admin/files/captions?category=${category.id}&filter=${entry.id}`}
            aria-current={entry.id === filterId ? "true" : undefined}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              entry.id === filterId
                ? "border-ink-300 bg-ink-100 text-ink-950"
                : "border-ink-200 text-ink-600 hover:bg-ink-50",
            )}
          >
            {entry.label}
          </Link>
        ))}
      </div>

      <p className="mt-5 text-sm text-ink-600">
        <span className="font-semibold text-accent-700">
          {missingCount} images missing captions
        </span>{" "}
        in {category.label}.
      </p>

      {params.done === "1" && (
        <div className="mt-4 rounded-lg border border-success-600/40 bg-success-600/10 px-4 py-3 text-sm text-ink-800">
          Every image in this view now has a caption.
        </div>
      )}

      {!current ? (
        <div className="mt-6 rounded-card border border-dashed border-ink-300 bg-white p-12 text-center text-sm text-ink-600">
          Nothing to show here.{" "}
          {missingCount === 0
            ? "Every image already has a caption."
            : "Upload images first."}
        </div>
      ) : (
        <>
          <CaptionEditor
            media={{
              id: current.id,
              url: current.url,
              path: current.path,
              type: current.type,
              caption: current.caption,
            }}
            category={category.id}
            remaining={missingCount}
            nextHref={nextHref}
          />

          <section className="mt-10">
            <h2 className="text-sm font-semibold text-ink-500">
              Queue ({images.length})
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {images.map((image) => (
                <li key={image.id}>
                  <Link
                    href={`/admin/files/captions?category=${category.id}&filter=${filterId}&id=${image.id}`}
                    title={image.path.split("/").pop()}
                    className={cn(
                      "block h-16 w-16 overflow-hidden rounded-md border transition-colors",
                      image.id === current.id
                        ? "border-brand-600 ring-2 ring-brand-600/30"
                        : "border-ink-200 hover:border-ink-400",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </Container>
  );
}

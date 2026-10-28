"use client";

import { PostBody } from "@/components/blog/post-body";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { getCategory } from "@/lib/catalogue/categories";
import type { PostBlock } from "@/lib/blog/blocks";
import type { Media } from "@/lib/media/types";

/** The real public blog layout, rendered with the current editor state. */
export function PostPreview({
  title,
  author,
  excerpt,
  category,
  thumbnailMediaId,
  blocks,
  media,
}: {
  title: string;
  author: string;
  excerpt: string;
  category: string;
  thumbnailMediaId: string | null;
  blocks: readonly PostBlock[];
  media: readonly Media[];
}) {
  const mediaById = new Map(media.map((entry) => [entry.id, entry]));
  const cover = thumbnailMediaId ? mediaById.get(thumbnailMediaId) : undefined;
  const categoryName = category
    ? (getCategory(category)?.displayName ?? category)
    : null;

  return (
    <div className="overflow-hidden rounded-card border border-ink-200 bg-white">
      <PageHeader title={title.trim() || "Untitled post"}>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-ink-500">
          By {author.trim() || "Safeway Tyre"}
          {categoryName ? <> · {categoryName}</> : null} · Preview
        </p>
      </PageHeader>

      <Container className="pt-12">
        {cover ? (
          <figure className="overflow-hidden rounded-lg border border-ink-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover.url}
              alt={cover.alt ?? (title || "Cover image")}
              className="block h-auto w-full"
            />
          </figure>
        ) : (
          <div className="flex aspect-[16/7] items-center justify-center rounded-lg border border-dashed border-ink-300 bg-ink-50 text-sm text-ink-500">
            Cover image placeholder
          </div>
        )}
      </Container>

      <Container size="narrow" className="py-12 lg:py-16">
        {excerpt.trim() && (
          <p className="mb-8 text-xl leading-relaxed text-pretty text-ink-600">
            {excerpt}
          </p>
        )}
        {blocks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ink-300 bg-ink-50 p-6 text-sm text-ink-600">
            Nothing to preview yet. Add a block in the editor.
          </p>
        ) : (
          <PostBody blocks={blocks} media={mediaById} preview />
        )}
      </Container>
    </div>
  );
}

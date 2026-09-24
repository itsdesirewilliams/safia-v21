import Link from "next/link";

import { ArrowIcon } from "@/components/ui/button";
import type { PostSummaryWithThumbnail } from "@/lib/blog/server";
import { ROUTES } from "@/lib/routes";

import { formatPostDate } from "./format";

/** A blog listing card: thumbnail, title, author and publish date. */
export function PostCard({ post }: { post: PostSummaryWithThumbnail }) {
  const date = formatPostDate(post.publishedAt);

  return (
    <Link
      href={ROUTES.post(post.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-ink-200 bg-white transition duration-300 hover:border-ink-300 hover:shadow-card"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-100">
        {post.thumbnail ? (
          /* eslint-disable-next-line @next/next/no-img-element -- media has no intrinsic dimensions to hand next/image */
          <img
            src={post.thumbnail.url}
            alt={post.thumbnail.alt ?? post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
              No image
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        {date && (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
            {date}
          </p>
        )}
        <h3 className="text-h3 mt-3 text-ink-950">{post.title}</h3>
        {post.excerpt && (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">
            {post.excerpt}
          </p>
        )}
        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-ink-700">
            By {post.author}
          </span>
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-colors duration-200 group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
            <ArrowIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

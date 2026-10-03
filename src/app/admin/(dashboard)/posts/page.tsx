import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/page-header";
import { formatPostDate } from "@/components/blog/format";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { requirePostsAccess } from "@/lib/auth/session";
import { postStatusLabel } from "@/lib/blog/post";
import { listPosts } from "@/lib/blog/server";
import { getMediaByIds } from "@/lib/media/server";

import { BlogImageUpload } from "./blog-image-upload";

export const metadata = { title: "Posts" };
export const dynamic = "force-dynamic";

type PostsSearchParams = { status?: string };

const TABS = [
  { id: "all", label: "All posts" },
  { id: "draft", label: "Drafts" },
  { id: "published", label: "Published" },
] as const;

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<PostsSearchParams>;
}) {
  await requirePostsAccess();

  const params = await searchParams;
  const status =
    params.status === "draft" || params.status === "published"
      ? params.status
      : "all";

  let posts: Awaited<ReturnType<typeof listPosts>> = [];
  let loadError: string | null = null;

  try {
    posts = await listPosts();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load posts.";
  }

  const filtered =
    status === "all" ? posts : posts.filter((post) => post.status === status);

  const thumbnailIds = filtered
    .map((post) => post.thumbnailMediaId)
    .filter((id): id is string => Boolean(id));
  const thumbnails = new Map(
    (thumbnailIds.length > 0 ? await getMediaByIds(thumbnailIds) : []).map(
      (media) => [media.id, media.url],
    ),
  );

  const counts = {
    all: posts.length,
    draft: posts.filter((post) => post.status === "draft").length,
    published: posts.filter((post) => post.status === "published").length,
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Blog"
        title="Posts"
        description="Create, edit and publish blog posts. Drafts stay private until published."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Content" },
          { label: "Posts" },
        ]}
        actions={
          <Link href="/admin/posts/new" className={buttonStyles("primary", "md")}>
            New post
          </Link>
        }
      />

      <BlogImageUpload />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const active = tab.id === status;
          return (
            <Link
              key={tab.id}
              href={tab.id === "all" ? "/admin/posts" : `/admin/posts?status=${tab.id}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900",
              )}
            >
              {tab.label}
              <span className={cn("ml-1.5", active ? "text-white/70" : "text-ink-400")}>
                {counts[tab.id]}
              </span>
            </Link>
          );
        })}
      </div>

      {loadError && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-brand-600/30 bg-brand-100/40 px-4 py-3 text-sm text-brand-700"
        >
          {loadError}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-ink-300 bg-white p-12 text-center text-sm text-ink-600">
          {status === "all"
            ? "No posts yet. Create the first one."
            : `No ${status} posts.`}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-ink-200 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Blog posts</caption>
            <thead className="bg-ink-50">
              <tr>
                {["Post", "Status", "Author", "Updated", "Published", ""].map(
                  (heading) => (
                    <th
                      key={heading || "actions"}
                      scope="col"
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className="border-t border-ink-200">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded border border-ink-200 bg-ink-50">
                        {post.thumbnailMediaId && thumbnails.get(post.thumbnailMediaId) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbnails.get(post.thumbnailMediaId)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] uppercase tracking-wide text-ink-400">
                            No image
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-xs truncate font-medium text-ink-950">
                          {post.title}
                        </span>
                        <span className="text-xs text-ink-400">/{post.slug}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-semibold",
                        post.status === "published"
                          ? "bg-success-600/10 text-success-600"
                          : "bg-ink-100 text-ink-600",
                      )}
                    >
                      {postStatusLabel(post.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{post.author}</td>
                  <td className="px-4 py-3 text-ink-600">
                    {formatPostDate(post.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {post.publishedAt ? formatPostDate(post.publishedAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className={buttonStyles("outline", "sm")}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

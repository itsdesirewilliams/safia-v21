import Link from "next/link";

import { formatPostDate } from "@/components/blog/format";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { requireMediaManager } from "@/lib/auth/session";
import { postStatusLabel } from "@/lib/blog/post";
import { listPosts } from "@/lib/blog/server";

export const metadata = { title: "Posts" };

export default async function AdminPostsPage() {
  await requireMediaManager();

  let posts: Awaited<ReturnType<typeof listPosts>> = [];
  let loadError: string | null = null;

  try {
    posts = await listPosts();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load posts.";
  }

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow text-brand-600">Blog CMS</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
            Posts
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-600">
            Create, edit and publish blog posts. Posts start as Drafts and only
            appear on the public site once published.
          </p>
        </div>
        <Link href="/admin/posts/new" className={buttonStyles("primary", "md")}>
          New post
        </Link>
      </div>

      {loadError && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-brand-600/30 bg-brand-100/40 px-4 py-3 text-sm text-brand-700"
        >
          {loadError}
        </p>
      )}

      {posts.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-ink-300 bg-white p-12 text-center text-sm text-ink-600">
          No posts yet. Create the first one.
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-card border border-ink-200 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">All blog posts</caption>
            <thead className="bg-ink-50">
              <tr>
                {["Title", "Status", "Author", "Updated", ""].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t border-ink-200">
                  <td className="px-4 py-3 font-medium text-ink-950">
                    {post.title}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        post.status === "published"
                          ? "rounded-lg bg-success-600/10 px-2.5 py-1 text-xs font-semibold text-success-600"
                          : "rounded-lg bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600"
                      }
                    >
                      {postStatusLabel(post.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{post.author}</td>
                  <td className="px-4 py-3 text-ink-600">
                    {formatPostDate(post.updatedAt)}
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
    </Container>
  );
}

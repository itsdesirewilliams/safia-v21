import Link from "next/link";
import { notFound } from "next/navigation";

import { formatPostDate } from "@/components/blog/format";
import { Container } from "@/components/ui/container";
import { canDeleteMedia } from "@/lib/auth/roles";
import { getCurrentProfile, requireMediaManager } from "@/lib/auth/session";
import { toMediaOptions } from "@/lib/blog/media-options";
import { postStatusLabel } from "@/lib/blog/post";
import { getPostById } from "@/lib/blog/server";
import { listMedia } from "@/lib/media/server";

import { PostActions } from "../../post-actions";
import { PostEditor } from "../../post-editor";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireMediaManager();
  const profile = await getCurrentProfile();
  const canDelete = canDeleteMedia(profile?.role ?? null);

  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const images = await listMedia({ type: "image", limit: 240 });
  const mediaOptions = toMediaOptions(images);

  return (
    <Container className="py-10">
      <Link
        href="/admin/posts"
        className="text-sm font-semibold text-brand-600 underline-offset-4 hover:underline"
      >
        ← All posts
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow text-brand-600">Blog CMS</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
            {post.title}
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            {postStatusLabel(post.status)} · updated {formatPostDate(post.updatedAt)}
          </p>
        </div>
        <PostActions
          postId={post.id}
          status={post.status}
          canDelete={canDelete}
        />
      </div>

      <PostEditor
        mode="edit"
        postId={post.id}
        mediaOptions={mediaOptions}
        defaults={{
          title: post.title,
          slug: post.slug,
          author: post.author,
          excerpt: post.excerpt ?? "",
          thumbnailMediaId: post.thumbnailMediaId,
          body: post.body,
        }}
      />
    </Container>
  );
}

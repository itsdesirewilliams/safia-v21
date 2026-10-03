import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/page-header";
import { formatPostDate } from "@/components/blog/format";
import { canDeletePosts } from "@/lib/auth/roles";
import { getCurrentProfile, requirePostsAccess } from "@/lib/auth/session";
import { toMediaOptions } from "@/lib/blog/media-options";
import { postStatusLabel } from "@/lib/blog/post";
import { getPostById } from "@/lib/blog/server";
import { listMedia } from "@/lib/media/server";

import { PostActions } from "../../post-actions";
import { PostEditor } from "../../post-editor";

export const metadata = { title: "Edit post" };
export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePostsAccess();
  const profile = await getCurrentProfile();
  const canDelete = canDeletePosts(profile?.role ?? null);

  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const images = await listMedia({ type: "image", limit: 240 });
  const mediaOptions = toMediaOptions(images);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Blog"
        title={post.title}
        description={`${postStatusLabel(post.status)} · updated ${formatPostDate(
          post.updatedAt,
        )}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Posts", href: "/admin/posts" },
          { label: "Edit" },
        ]}
        actions={
          <PostActions
            postId={post.id}
            status={post.status}
            canDelete={canDelete}
          />
        }
      />

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
    </div>
  );
}

import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/page-header";
import { formatPostDate } from "@/components/blog/format";
import { canDeletePosts } from "@/lib/auth/roles";
import { getCurrentProfile, requirePostsAccess } from "@/lib/auth/session";
import { postStatusLabel } from "@/lib/blog/post";
import { getPostById } from "@/lib/blog/server";
import { getMediaByIds, listMedia } from "@/lib/media/server";

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
  const preferredIds = [post.thumbnailMediaId, post.ogMediaId].filter(
    (value): value is string => Boolean(value),
  );
  const preferred =
    preferredIds.length > 0 ? await getMediaByIds(preferredIds) : [];
  const mediaLibrary = [
    ...preferred,
    ...images.filter(
      (entry) => !preferred.some((preferredEntry) => preferredEntry.id === entry.id),
    ),
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Blog"
        title={post.title.trim() || "Untitled draft"}
        description={`${postStatusLabel(post.status)} · updated ${formatPostDate(
          post.updatedAt,
        )}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Posts", href: "/admin/posts" },
          { label: "Edit" },
        ]}
        actions={
          <PostActions postId={post.id} canDelete={canDelete} />
        }
      />

      <PostEditor
        mode="edit"
        postId={post.id}
        mediaLibrary={mediaLibrary}
        defaults={{
          title: post.title,
          slug: post.slug,
          author: post.author,
          excerpt: post.excerpt ?? "",
          category: post.category ?? "",
          thumbnailMediaId: post.thumbnailMediaId,
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
          ogMediaId: post.ogMediaId,
          body: post.body,
          status: post.status,
          publishedSlug: post.status === "published" ? post.slug : null,
        }}
      />
    </div>
  );
}

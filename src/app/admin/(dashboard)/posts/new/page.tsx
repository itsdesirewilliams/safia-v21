import { AdminPageHeader } from "@/components/admin/page-header";
import { requirePostsAccess } from "@/lib/auth/session";
import { listMedia } from "@/lib/media/server";

import { PostEditor } from "../post-editor";

export const metadata = { title: "New post" };
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  await requirePostsAccess();

  const images = await listMedia({ type: "image", limit: 240 });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Blog"
        title="New post"
        description="A new post starts as a draft. Save it, preview it, then publish when it is ready."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Posts", href: "/admin/posts" },
          { label: "New" },
        ]}
      />

      <PostEditor
        mode="create"
        mediaLibrary={images}
        defaults={{
          title: "",
          slug: "",
          author: "",
          excerpt: "",
          category: "",
          thumbnailMediaId: null,
          seoTitle: "",
          seoDescription: "",
          ogMediaId: null,
          body: [],
          status: "draft",
          publishedSlug: null,
        }}
      />
    </div>
  );
}

import { AdminPageHeader } from "@/components/admin/page-header";
import { requirePostsAccess } from "@/lib/auth/session";
import { toMediaOptions } from "@/lib/blog/media-options";
import { listMedia } from "@/lib/media/server";

import { PostEditor } from "../post-editor";

export const metadata = { title: "New post" };
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  await requirePostsAccess();

  const images = await listMedia({ type: "image", limit: 240 });
  const mediaOptions = toMediaOptions(images);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Blog"
        title="New post"
        description="A new post starts as a draft. Save it, then publish it when it is ready."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Posts", href: "/admin/posts" },
          { label: "New" },
        ]}
      />

      <PostEditor
        mode="create"
        mediaOptions={mediaOptions}
        defaults={{
          title: "",
          slug: "",
          author: "",
          excerpt: "",
          thumbnailMediaId: null,
          body: [],
        }}
      />
    </div>
  );
}

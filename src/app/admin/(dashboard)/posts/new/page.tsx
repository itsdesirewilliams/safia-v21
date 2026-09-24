import { Container } from "@/components/ui/container";
import { requireMediaManager } from "@/lib/auth/session";
import { toMediaOptions } from "@/lib/blog/media-options";
import { listMedia } from "@/lib/media/server";

import { PostEditor } from "../post-editor";

export const metadata = { title: "New post" };

export default async function NewPostPage() {
  await requireMediaManager();

  const images = await listMedia({ type: "image", limit: 240 });
  const mediaOptions = toMediaOptions(images);

  return (
    <Container className="py-10">
      <p className="text-eyebrow text-brand-600">Blog CMS</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
        New post
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-600">
        A new post starts as a Draft. Save it, then publish it from the post
        screen when it is ready.
      </p>

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
    </Container>
  );
}

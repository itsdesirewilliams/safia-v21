import type { Media } from "@/lib/media/types";

import type { PostStatus } from "./post";

/** The serialisable payload the block editor sends to the Post actions. */
export type PostEditorPayload = {
  title: string;
  slug: string;
  author: string;
  excerpt: string;
  category: string;
  thumbnailMediaId: string | null;
  seoTitle: string;
  seoDescription: string;
  ogMediaId: string | null;
  body: unknown;
  /** The slug the post had when it was opened, for revalidation. */
  previousSlug?: string | null;
};

export type PostSaveResult =
  | {
      ok: true;
      postId: string;
      slug: string;
      status: PostStatus;
      message: string;
    }
  | {
      ok: false;
      message: string;
      errors?: Record<string, string>;
    };

/** Metadata sent to the server after a direct Storage upload. */
export type BlogMediaUploadEntry = {
  path: string;
  mimeType: string;
  sizeBytes: number;
  alt?: string | null;
  caption?: string | null;
};

export type BlogMediaUploadResult =
  | { ok: true; media: Media }
  | { ok: false; error: string };

import Link from "next/link";
import { notFound } from "next/navigation";

import { PostBody } from "@/components/blog/post-body";
import { formatPostDate } from "@/components/blog/format";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { collectMediaIds } from "@/lib/blog/blocks";
import { getPublishedPostBySlug } from "@/lib/blog/server";
import { getMediaByIds } from "@/lib/media/server";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  return {
    title: post ? post.title : "Post",
    description: post?.excerpt ?? undefined,
  };
}

/**
 * A single published Post (spec #2 / Ticket 9). The body is a structured block
 * model; image blocks resolve their Media reference through the shared Media
 * layer. Drafts and unknown slugs 404.
 */
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const media = await getMediaByIds(collectMediaIds(post.body));
  const mediaById = new Map(media.map((entry) => [entry.id, entry]));
  const date = formatPostDate(post.publishedAt);

  return (
    <article className="bg-white">
      <PageHeader title={post.title}>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-ink-500">
          By {post.author}
          {date && <> · {date}</>}
        </p>
      </PageHeader>

      {post.thumbnail && (
        <Container className="pt-12">
          <figure className="overflow-hidden rounded-lg border border-ink-200">
            {/* eslint-disable-next-line @next/next/no-img-element -- media has no intrinsic dimensions to hand next/image */}
            <img
              src={post.thumbnail.url}
              alt={post.thumbnail.alt ?? post.title}
              className="block h-auto w-full"
            />
          </figure>
        </Container>
      )}

      <Container size="narrow" className="py-12 lg:py-16">
        {post.excerpt && (
          <p className="mb-8 text-xl leading-relaxed text-pretty text-ink-600">
            {post.excerpt}
          </p>
        )}

        <PostBody blocks={post.body} media={mediaById} />

        <div className="mt-14 border-t border-ink-200 pt-8">
          <Link
            href={ROUTES.blogs}
            className="text-sm font-semibold text-brand-600 underline-offset-4 hover:underline"
          >
            ← Back to all posts
          </Link>
        </div>
      </Container>
    </article>
  );
}

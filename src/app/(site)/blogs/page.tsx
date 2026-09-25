import { Pagination } from "@/components/blog/pagination";
import { PostCard } from "@/components/blog/post-card";
import { Container } from "@/components/ui/container";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import { listPublishedPosts } from "@/lib/blog/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog",
  description:
    "News, product notes and updates from Safeway Tyre — patterns, ranges and the work behind them.",
};

/**
 * The blog listing (spec #2 / Ticket 9): published posts only, newest first,
 * 12 per page. Visibility is enforced by Postgres RLS, not this page.
 */
export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const requested = Number.parseInt(params.page ?? "1", 10);
  const { posts, page, pageCount } = await listPublishedPosts(requested);

  return (
    <>
      <section className="border-b border-ink-200 bg-ink-50">
        <Container className="py-14 lg:py-20">
          <h1 className="text-h1 max-w-3xl text-balance text-ink-950">
            News &amp; Updates
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pretty text-ink-600">
            Product notes, range updates and stories from Safeway Tyre.
          </p>
        </Container>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <Container>
          {posts.length === 0 ? (
            <PlaceholderPanel
              kind="media"
              label="No Posts Yet"
              detail="News and updates from Safeway Tyre will appear here soon."
            />
          ) : (
            <>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, index) => (
                  <li key={post.id}>
                    <Reveal delay={(index % 3) * 90} className="h-full">
                      <PostCard post={post} />
                    </Reveal>
                  </li>
                ))}
              </ul>
              <Pagination page={page} pageCount={pageCount} />
            </>
          )}
        </Container>
      </section>
    </>
  );
}

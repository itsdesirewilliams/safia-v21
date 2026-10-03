import { Pagination } from "@/components/blog/pagination";
import { PostCard } from "@/components/blog/post-card";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import { listPublishedPosts } from "@/lib/blog/server";
import { getDictionary } from "@/lib/i18n/server";
import { languageAlternates } from "@/lib/i18n/url";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const dict = await getDictionary();
  return {
    title: dict.blog.title,
    description: dict.blog.description,
    alternates: { canonical: "/blogs", languages: languageAlternates("/blogs") },
  };
}

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
  const [{ posts, page, pageCount }, dict] = await Promise.all([
    listPublishedPosts(requested),
    getDictionary(),
  ]);

  return (
    <>
      <PageHeader title={dict.blog.title} description={dict.blog.description} />

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

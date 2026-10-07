import { SearchExperience } from "@/components/search/search-experience";
import { Container } from "@/components/ui/container";
import {
  MIN_SEARCH_LENGTH,
  sanitizeQuery,
  searchPatterns,
  toPublicResult,
  type SearchResult,
} from "@/lib/catalogue/search";
import {
  HERO_PLACEHOLDER_PHRASES,
  HERO_SUGGESTION_POOL,
} from "@/lib/homepage";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { languageAlternates } from "@/lib/i18n/url";
import { ROUTES } from "@/lib/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const dict = await getDictionary();
  return {
    title: dict.search.title,
    description: dict.search.description,
    alternates: {
      canonical: ROUTES.search,
      languages: languageAlternates(ROUTES.search),
    },
  };
}

/**
 * The dedicated search page. There is deliberately no marketing hero: the page
 * goes straight from the header into the search experience. The query is
 * carried in `?q=` so a search is shareable and refresh-safe; the initial
 * results are rendered server-side through the same `searchPatterns` pipeline
 * the API uses, then refreshed live by the shared `SearchExperience`.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const initialQuery = typeof raw === "string" ? raw : "";
  const query = sanitizeQuery(initialQuery);

  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  let initialResults: SearchResult[] = [];
  if (query.length >= MIN_SEARCH_LENGTH) {
    try {
      const supabase = await createSupabaseServerClient();
      initialResults = (await searchPatterns(supabase, query)).map(
        toPublicResult,
      );
    } catch {
      // Search must never break the page; degrade to no results.
      initialResults = [];
    }
  }

  return (
    <div className="bg-white pt-10 pb-16 lg:pt-14 lg:pb-24">
      <Container size="listing">
        <SearchExperience
          initialQuery={initialQuery}
          initialResults={initialResults}
          labels={dict.search}
          suggestions={HERO_SUGGESTION_POOL}
          placeholderPhrases={HERO_PLACEHOLDER_PHRASES}
          locale={locale}
        />
      </Container>
    </div>
  );
}

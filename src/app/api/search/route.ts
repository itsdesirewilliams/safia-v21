import { NextResponse } from "next/server";

import {
  MIN_SEARCH_LENGTH,
  normalizeSearchQuery,
  searchPatterns,
} from "@/lib/catalogue/search";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Live product-search endpoint for the homepage dropdown (spec #8). The query
 * runs server-side in Postgres; hits resolve to Patterns. There is no separate
 * search-results route.
 */
export async function GET(request: Request) {
  const query = normalizeSearchQuery(
    new URL(request.url).searchParams.get("q"),
  );

  if (query.length < MIN_SEARCH_LENGTH) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const results = await searchPatterns(supabase, query);
    return NextResponse.json({ results });
  } catch {
    // Search must never break the page; degrade to no results.
    return NextResponse.json({ results: [] });
  }
}

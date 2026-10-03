import { type Role, canManageMedia, canManagePosts } from "@/lib/auth/roles";
import { listPosts } from "@/lib/blog/server";
import type { PostSummary } from "@/lib/blog/post";
import { countMissingCaptions, listMediaWithSizes } from "@/lib/media/library";
import type { LibraryFile } from "@/lib/media/library";
import { countMedia } from "@/lib/media/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Real dashboard figures, read through the request's Supabase session client so
 * RLS governs what each role can see. Nothing is invented: every number is a
 * live count and every list is live data. Individual failures degrade to null /
 * empty rather than breaking the dashboard.
 */

export type DashboardStats = {
  showMedia: boolean;
  showPosts: boolean;
  mediaTotal: number | null;
  galleryCount: number | null;
  productCount: number | null;
  blogCount: number | null;
  qualityCount: number | null;
  missingCaptions: number | null;
  totalPosts: number | null;
  publishedPosts: number | null;
  draftPosts: number | null;
  recentMedia: LibraryFile[];
  recentPosts: PostSummary[];
};

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

async function countPosts(status?: "draft" | "published"): Promise<number> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("posts")
    .select("id", { count: "exact", head: true });
  if (status) {
    query = query.eq("status", status);
  }
  const { count, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return count ?? 0;
}

export async function loadDashboard(role: Role | null): Promise<DashboardStats> {
  const showMedia = canManageMedia(role);
  const showPosts = canManagePosts(role);

  const [
    mediaTotal,
    galleryCount,
    productCount,
    blogCount,
    qualityCount,
    missingCaptions,
    totalPosts,
    publishedPosts,
    recentMedia,
    allPosts,
  ] = await Promise.all([
    showMedia ? safe(() => countMedia({}), null) : Promise.resolve(null),
    showMedia
      ? safe(() => countMedia({ buckets: ["gallery"] }), null)
      : Promise.resolve(null),
    showMedia
      ? safe(() => countMedia({ buckets: ["product-images"] }), null)
      : Promise.resolve(null),
    showMedia
      ? safe(() => countMedia({ buckets: ["blog-images"] }), null)
      : Promise.resolve(null),
    showMedia
      ? safe(
          () => countMedia({ buckets: ["testing-videos", "machine-images"] }),
          null,
        )
      : Promise.resolve(null),
    showMedia ? safe(() => countMissingCaptions({}), null) : Promise.resolve(null),
    showPosts ? safe(() => countPosts(), null) : Promise.resolve(null),
    showPosts ? safe(() => countPosts("published"), null) : Promise.resolve(null),
    showMedia
      ? safe(() => listMediaWithSizes({ limit: 6 }), [])
      : Promise.resolve([]),
    showPosts ? safe(() => listPosts(), []) : Promise.resolve([]),
  ]);

  return {
    showMedia,
    showPosts,
    mediaTotal,
    galleryCount,
    productCount,
    blogCount,
    qualityCount,
    missingCaptions,
    totalPosts,
    publishedPosts,
    draftPosts:
      totalPosts !== null && publishedPosts !== null
        ? totalPosts - publishedPosts
        : null,
    recentMedia,
    recentPosts: allPosts.slice(0, 6),
  };
}

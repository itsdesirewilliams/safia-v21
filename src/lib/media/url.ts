import type { StorageBucketId } from "@/lib/supabase/buckets";

/**
 * The single place that turns a stored bucket + object path into a URL. Public
 * components consume media through this layer rather than hard-coding
 * Supabase Storage URLs.
 */
export function resolveMediaPublicUrl(
  supabaseUrl: string,
  bucket: StorageBucketId | string,
  path: string,
): string {
  const base = supabaseUrl.replace(/\/+$/, "");
  const segments = path.split("/").filter((segment) => segment !== "");

  if (segments.some((segment) => segment === "..")) {
    throw new Error(`Refusing to resolve a media path with traversal: ${path}`);
  }

  const encoded = segments.map((segment) => encodeURIComponent(segment)).join("/");

  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}

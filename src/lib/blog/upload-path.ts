/** Image MIME types accepted by the block editor and its server action. */
export const BLOG_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/** Storage paths the block editor may create for blog images. */
export const BLOG_MEDIA_PATH_PATTERN =
  /^blog\/\d{4}-\d{2}\/[a-z0-9-]+\.[a-z0-9]+$/;

/** Reject traversal and paths outside the editor's `blog/` namespace. */
export function isSafeBlogMediaPath(path: string): boolean {
  return (
    BLOG_MEDIA_PATH_PATTERN.test(path) &&
    !path.includes("..") &&
    !path.startsWith("/")
  );
}

/**
 * Shared slug helper. Lowercases and replaces every run of non-alphanumeric
 * characters with a single dash, then trims dashes from the ends. Used for
 * catalogue Pattern slugs and blog Post slugs.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

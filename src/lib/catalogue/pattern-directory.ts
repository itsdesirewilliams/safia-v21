import type { PatternImageDirectoryEntry } from "@/lib/media/pattern-image-batch";

import { CATEGORIES } from "./categories";
import { CATALOGUE } from "./dataset";
import type { NormalizedPattern } from "./normalize";

/**
 * A serializable index of every Pattern, for the Admin Pattern Image uploader.
 * It carries no Variants, so it can be passed from the server page to the
 * client uploader without shipping the whole catalogue.
 */
export function patternDirectory(): PatternImageDirectoryEntry[] {
  const nameBySlug = new Map(
    CATEGORIES.map((category) => [category.slug, category.displayName]),
  );

  return CATALOGUE.patterns.map((pattern) => ({
    patternCode: pattern.patternCode,
    displayName: pattern.displayName,
    categorySlug: pattern.categorySlug,
    categoryName: nameBySlug.get(pattern.categorySlug) ?? pattern.categorySlug,
  }));
}

/** Every Pattern whose `patternCode` matches (case-insensitive). */
export function findPatternsByCode(code: string): NormalizedPattern[] {
  const normalized = code.trim().toUpperCase();
  return CATALOGUE.patterns.filter(
    (pattern) => pattern.patternCode.trim().toUpperCase() === normalized,
  );
}

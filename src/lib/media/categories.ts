import type { StorageBucketId } from "@/lib/supabase/buckets";

/**
 * The File Manager's admin-managed media categories (spec: central File
 * Management). Each category maps onto the existing shared Media layer by
 * bucket — no new tables, buckets or storage systems.
 */
export type FileCategory = {
  id: string;
  label: string;
  /** Buckets this category spans; `null` means every bucket. */
  buckets: readonly StorageBucketId[] | null;
  description: string;
};

export const FILE_CATEGORIES: readonly FileCategory[] = [
  {
    id: "all",
    label: "All Files",
    buckets: null,
    description: "Every Admin-managed file across all buckets.",
  },
  {
    id: "gallery",
    label: "Gallery",
    buckets: ["gallery"],
    description: "Images shown in the public Gallery.",
  },
  {
    id: "product-images",
    label: "Product Images",
    buckets: ["product-images"],
    description: "Pattern/product imagery.",
  },
  {
    id: "blog-images",
    label: "Blog Images",
    buckets: ["blog-images"],
    description: "Images and media used by blog posts.",
  },
  {
    id: "quality-first",
    label: "Quality First",
    buckets: ["testing-videos", "machine-images"],
    description: "Testing videos and machine imagery.",
  },
];

/** The read-only, developer/repository-managed assets pseudo-category. */
export const REPOSITORY_CATEGORY_ID = "repository";

export function isFileCategoryId(value: unknown): boolean {
  return typeof value === "string" && FILE_CATEGORIES.some((c) => c.id === value);
}

/** Resolve a category id, defaulting to "All Files". */
export function findFileCategory(id: string | null | undefined): FileCategory {
  return FILE_CATEGORIES.find((category) => category.id === id) ??
    FILE_CATEGORIES[0];
}

/** The buckets a category spans, or `null` for every bucket. */
export function categoryBuckets(
  id: string | null | undefined,
): readonly StorageBucketId[] | null {
  return findFileCategory(id).buckets;
}

import { normalizeTyreSize } from "@/lib/search/tyre-size";

export function looseSizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[×✕]/g, "x")
    .replace(/[^a-z0-9]/g, "");
}

export function matchesSizeQuery(
  value: { size: string; cells?: Record<string, string | null> },
  query: string,
): boolean {
  const trimmed = query.trim();
  if (!trimmed) {
    return true;
  }

  const canonical = normalizeTyreSize(trimmed);
  const loose = looseSizeKey(trimmed);
  const rowCanonical = normalizeTyreSize(value.size);
  const rowLoose = looseSizeKey(value.size);

  if (canonical && rowCanonical && rowCanonical === canonical) {
    return true;
  }
  if (loose && rowLoose === loose) {
    return true;
  }
  if (canonical && canonical.length >= 2 && rowCanonical?.includes(canonical)) {
    return true;
  }
  if (loose.length >= 2 && rowLoose.includes(loose)) {
    return true;
  }

  const haystack = Object.values(value.cells ?? {})
    .filter((entry): entry is string => Boolean(entry))
    .join(" ")
    .toLowerCase();
  return trimmed.length >= 2 && haystack.includes(trimmed.toLowerCase());
}

/**
 * The customer-facing eyebrow for a Pattern card / detail block.
 *
 * A Pattern's `displayName` is the source `name` carried through normalization:
 * for Agriculture, OTR and Forklift it is the real functional name; for the
 * remaining ranges it is the Category name. The eyebrow therefore shows the
 * functional name where one exists and falls back to the Category name — never
 * an invented label.
 */
export function patternEyebrow(
  displayName: string,
  categoryName: string,
): string {
  const name = displayName.trim();
  if (name === "" || name.toLowerCase() === categoryName.trim().toLowerCase()) {
    return categoryName;
  }
  return name;
}

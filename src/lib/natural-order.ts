/**
 * Natural ordering for developer- and storage-named files: `slide-2` sorts
 * before `slide-10`. Shared by the responsive slider and Quality First media
 * discovery so both order files the way a human expects.
 */

const NATURAL_COLLATOR = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export function naturalCompare(a: string, b: string): number {
  return NATURAL_COLLATOR.compare(a, b);
}

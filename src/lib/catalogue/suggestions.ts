/**
 * Homepage hero search suggestions.
 *
 * The suggestion *pool* is built server-side from the bundled master dataset
 * (see `src/lib/homepage.ts`) and passed to the client. This module is pure and
 * dataset-free so the client only ships the selection logic: one category, one
 * real tyre size and one real functional/display name, drawn from the pool and
 * rotated on a timer.
 */

export type HeroSuggestionKind = "category" | "size" | "name";

export type HeroSuggestion = {
  kind: HeroSuggestionKind;
  /** The value shown to the visitor. */
  label: string;
  /** A short supporting hint (pattern code or pattern count). */
  hint: string;
  /** The real search term this suggestion represents. */
  query: string;
  /** The resolved Pattern or Category destination. */
  href: string;
};

export type HeroSuggestionPool = {
  category: readonly HeroSuggestion[];
  size: readonly HeroSuggestion[];
  name: readonly HeroSuggestion[];
};

export const HERO_SUGGESTION_COUNT = 3;
export const HERO_SUGGESTION_PER_KIND = 1;
/** Rotation cadence for the suggestions, in milliseconds (three per two minutes). */
export const HERO_SUGGESTION_ROTATE_MS = 40_000;

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const shuffled = [...items];
  let state = (seed * 2654435761 + 1) % 2147483647;
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (state * 1103515245 + 12345) % 2147483648;
    const swap = Math.abs(state) % (index + 1);
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled;
}

function take<T>(items: readonly T[], count: number, seed: number): T[] {
  if (items.length <= count) {
    return [...items];
  }
  return seededShuffle(items, seed).slice(0, count);
}

/**
 * Pick the six hero suggestions for a rotation. Pure and deterministic for a
 * given seed so the server and client render an identical initial set; the seed
 * advances on a timer to rotate the selection.
 */
export function pickHeroSuggestions(
  pool: HeroSuggestionPool,
  seed: number,
): HeroSuggestion[] {
  const category = take(pool.category, HERO_SUGGESTION_PER_KIND, seed);
  const size = take(pool.size, HERO_SUGGESTION_PER_KIND, seed + 1);
  const name = take(pool.name, HERO_SUGGESTION_PER_KIND, seed + 2);

  const ordered: HeroSuggestion[] = [];
  for (let index = 0; index < HERO_SUGGESTION_PER_KIND; index += 1) {
    for (const bucket of [category, size, name]) {
      const suggestion = bucket[index];
      if (suggestion) {
        ordered.push(suggestion);
      }
    }
  }

  if (ordered.length >= HERO_SUGGESTION_COUNT) {
    return ordered.slice(0, HERO_SUGGESTION_COUNT);
  }

  const chosen = new Set(ordered);
  const remainder = [...pool.category, ...pool.size, ...pool.name].filter(
    (suggestion) => !chosen.has(suggestion),
  );

  return [...ordered, ...remainder].slice(0, HERO_SUGGESTION_COUNT);
}
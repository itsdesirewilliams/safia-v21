/**
 * Best-effort in-memory fixed-window rate limiter for the public contact forms
 * (spec #6). It is per-instance, which is enough to blunt casual spam; a
 * durable limiter is a later concern.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export const RATE_LIMIT = {
  limit: 5,
  windowMs: 60_000,
} as const;

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return true;
  }

  if (bucket.count >= RATE_LIMIT.limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

/** Test helper — clears all windows. */
export function resetRateLimits(): void {
  buckets.clear();
}

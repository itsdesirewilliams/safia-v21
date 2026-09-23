import { afterEach, describe, expect, it, vi } from "vitest";

import {
  RATE_LIMIT,
  checkRateLimit,
  resetRateLimits,
} from "@/lib/contact/rate-limit";

afterEach(() => {
  resetRateLimits();
  vi.useRealTimers();
});

describe("checkRateLimit", () => {
  it("allows up to the limit, then blocks", () => {
    for (let attempt = 0; attempt < RATE_LIMIT.limit; attempt += 1) {
      expect(checkRateLimit("203.0.113.1")).toBe(true);
    }
    expect(checkRateLimit("203.0.113.1")).toBe(false);
  });

  it("tracks keys independently", () => {
    for (let attempt = 0; attempt < RATE_LIMIT.limit; attempt += 1) {
      checkRateLimit("203.0.113.1");
    }
    expect(checkRateLimit("203.0.113.2")).toBe(true);
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    for (let attempt = 0; attempt < RATE_LIMIT.limit; attempt += 1) {
      checkRateLimit("203.0.113.1");
    }
    expect(checkRateLimit("203.0.113.1")).toBe(false);

    vi.advanceTimersByTime(RATE_LIMIT.windowMs + 1);
    expect(checkRateLimit("203.0.113.1")).toBe(true);
  });
});

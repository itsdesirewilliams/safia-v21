import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { HOME_CATEGORY_CARDS } from "@/lib/homepage";

const PORT = 4312;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function loadDotEnvLocal(): Record<string, string> {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    const env: Record<string, string> = {};
    for (const line of raw.split(/\r?\n/)) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (match) {
        env[match[1]] = match[2].replace(/^"|"$/g, "");
      }
    }
    return env;
  } catch {
    return {};
  }
}

let server: ChildProcess | undefined;

async function waitForServer(url: string, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));
    }
  }
  throw new Error(`Server did not become ready at ${url}`);
}

beforeAll(async () => {
  const nextBin = resolve(
    process.cwd(),
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );

  server = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    cwd: process.cwd(),
    env: { ...process.env, ...loadDotEnvLocal() },
    stdio: "pipe",
  });

  await waitForServer(`${BASE_URL}/`);
}, 120_000);

afterAll(() => {
  server?.kill();
});

describe("homepage vertical slice", () => {
  it("renders every section end-to-end", async () => {
    const html = await (await fetch(`${BASE_URL}/`)).text();

    expect(html).toContain("Tyres that keep the world moving");
    expect(html).toContain("Take a tour of our industry");
    expect(html).toContain("Product ranges");
    expect(html).toContain("Explore the official catalogue");
    expect(html).toContain("Certification marks not supplied");
    expect(html).toContain("Testimonials not supplied");
    expect(html).toContain("Latest on Instagram");
    expect(html).toContain("Send us an enquiry");
    expect(html).toContain("Find us on the map");
    expect(html).toContain("Director@safewaytyre.com");
  });

  it("shows the six product range cards linking to canonical routes", async () => {
    const html = await (await fetch(`${BASE_URL}/`)).text();

    for (const card of HOME_CATEGORY_CARDS) {
      expect(html).toContain(`href="/products/${card.slug}"`);
    }
  });

  it("reuses the Contact Us Query form fields", async () => {
    const html = await (await fetch(`${BASE_URL}/`)).text();

    expect(html).toContain('name="name"');
    expect(html).toContain('name="country"');
    expect(html).toContain('name="phone"');
    expect(html).toContain('name="category"');
    expect(html).toContain('name="message"');
    expect(html).toContain('name="company"');
  });

  it("embeds the configured map and hides the Instagram feed gracefully", async () => {
    const html = await (await fetch(`${BASE_URL}/`)).text();

    expect(html).toContain("google.com/maps?q=");
    expect(html).toContain("Instagram feed not connected");
  });

  it("exposes no pricing anywhere", async () => {
    const html = await (await fetch(`${BASE_URL}/`)).text();

    expect(html).not.toMatch(/fob/i);
    expect(html).not.toContain("USD");
  });
});

describe("server-side product search", () => {
  it("resolves a size query to a Pattern", async () => {
    const response = await fetch(`${BASE_URL}/api/search?q=6.00-16`);
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      results: { patternSlug: string; categorySlug: string; sizes: string[] }[];
    };

    expect(body.results.length).toBeGreaterThan(0);
    const match = body.results.find(
      (result) => result.patternSlug === "bias-tractor-tyres-tr-1042",
    );
    expect(match).toBeDefined();
    expect(match?.categorySlug).toBe("agriculture");
  });

  it("resolves a pattern-code query to a Pattern", async () => {
    const response = await fetch(`${BASE_URL}/api/search?q=TR-1042`);
    const body = (await response.json()) as {
      results: { patternSlug: string; patternCode: string }[];
    };

    expect(body.results[0]?.patternSlug).toBe("bias-tractor-tyres-tr-1042");
    expect(body.results[0]?.patternCode).toBe("TR-1042");
  });

  it("resolves a category query to Patterns", async () => {
    const response = await fetch(`${BASE_URL}/api/search?q=truck`);
    const body = (await response.json()) as {
      results: { categorySlug: string; patternSlug: string }[];
    };

    expect(body.results.length).toBeGreaterThan(0);
    for (const result of body.results) {
      expect(result.categorySlug).toBe("truck-bus");
      expect(result.patternSlug).toBeTruthy();
    }
  });

  it("returns no results for a short query", async () => {
    const response = await fetch(`${BASE_URL}/api/search?q=a`);
    const body = (await response.json()) as { results: unknown[] };
    expect(body.results).toEqual([]);
  });

  it("excludes Tubes from search", async () => {
    for (const query of ["tubes", "Butyl", "TU-101"]) {
      const response = await fetch(
        `${BASE_URL}/api/search?q=${encodeURIComponent(query)}`,
      );
      const body = (await response.json()) as {
        results: { categorySlug: string }[];
      };
      expect(body.results).toEqual([]);
    }
  });
});

import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PRODUCT_MENU_ORDER } from "@/lib/catalogue/categories";

const PORT = 4340;
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

async function get(path: string): Promise<{ status: number; html: string }> {
  const response = await fetch(`${BASE_URL}${path}`);
  return { status: response.status, html: await response.text() };
}

describe("search page", () => {
  it("renders the dedicated search experience at /search", async () => {
    const { status, html } = await get("/search");

    expect(status).toBe(200);
    expect(html).toContain("Try searching");
    expect(html).toContain('placeholder="Try searching');
  });

  it("has no marketing hero between the header and the search experience", async () => {
    const { html } = await get("/search");

    // The PageHeader hero (an <h1>) is gone; the experience sits directly
    // under the header. (The description survives only as page metadata.)
    expect(html).not.toContain("<h1");
  });

  it("never puts a Pattern Code in the placeholder or popular searches", async () => {
    const { html } = await get("/search");

    expect(html).not.toMatch(/\bFM\d{2,}\b/);
    expect(html).not.toMatch(/\bRT\d{3,}\b/);
  });

  it("finds a TBR radial size from ?q=295/80R22.5", async () => {
    const { status, html } = await get("/search?q=295%2F80R22.5");

    expect(status).toBe(200);
    expect(html).toContain("295/80R22.5");
    expect(html).toContain("/products/truck-bus-tire/tbr-safeway/");
  });

  it("finds a PCR radial size from ?q=205/65R15", async () => {
    const { status, html } = await get("/search?q=205%2F65R15");

    expect(status).toBe(200);
    expect(html).toContain("205/65R15");
    expect(html).toContain("/products/truck-bus-tire/pcr-safeway/");
  });

  it("never exposes a Pattern Code for a size search", async () => {
    const { html } = await get("/search?q=295%2F80R22.5");

    expect(html).not.toMatch(/\bFM\d{2,}\b/);
  });

  it("shows a no-results state for an unknown query", async () => {
    const { status, html } = await get("/search?q=zzzzzz");

    expect(status).toBe(200);
    expect(html).toContain("No matching products found");
  });

  it("still serves the existing category search", async () => {
    const { html } = await get("/search?q=truck");

    expect(html).toContain("/products/truck-bus/");
  });
});

describe("header search trigger", () => {
  it("points the search icon at /search and never at the homepage", async () => {
    const { html } = await get("/");

    expect(html).toContain('href="/search"');
    expect(html).not.toContain('href="/#search"');
  });
});

describe("Products menu markup", () => {
  it("lists the seven ranges in the required order", async () => {
    const { html } = await get("/");

    const positions = PRODUCT_MENU_ORDER.map((slug) =>
      html.indexOf(`href="/products/${slug}"`),
    );

    for (const position of positions) {
      expect(position).toBeGreaterThan(-1);
    }
    for (let index = 1; index < positions.length; index += 1) {
      expect(positions[index]).toBeGreaterThan(positions[index - 1]);
    }
  });

  it("exposes the Truck & Bus radial submenu links", async () => {
    const { html } = await get("/");

    expect(html).toContain("/products/truck-bus-tire/pcr-safeway");
    expect(html).toContain("/products/truck-bus-tire/tbr-safeway");
  });
});

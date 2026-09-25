import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PORT = 4317;
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

  await waitForServer(`${BASE_URL}/catalogue`);
}, 120_000);

afterAll(() => {
  server?.kill();
});

async function get(path: string): Promise<string> {
  const response = await fetch(`${BASE_URL}${path}`);
  expect(response.status).toBe(200);
  return response.text();
}

describe("Catalogue page", () => {
  it("renders the responsive slider from the supplied artwork", async () => {
    const html = await get("/catalogue");

    expect(html).toContain("The Safeway Tyre Catalogue");
    expect(html).toContain("<picture>");
    expect(html).toContain("/assets/landscape/catalogue/");
    expect(html).toContain("/assets/portrait/catalogue/");
    expect(html).toContain('aria-label="Previous slide"');
    expect(html).toContain('aria-label="Next slide"');
  });

  it("surfaces the catalogue download region", async () => {
    const html = await get("/catalogue");
    expect(html).toContain("Catalogue Download Coming Soon");
  });

  it("links every canonical category", async () => {
    const html = await get("/catalogue");

    for (const slug of [
      "motorcycle",
      "three-wheeler",
      "truck-bus",
      "agriculture",
      "otr",
      "forklift",
    ]) {
      expect(html).toContain(`href="/products/${slug}"`);
    }
    expect(html).toContain(
      "Purpose-built tyres for tractors and agricultural equipment",
    );
  });
});

describe("Category listing", () => {
  it("lists the patterns in a category with their display name and code", async () => {
    const html = await get("/products/agriculture");

    expect(html).toContain("Agriculture Tyres");
    expect(html).toContain("BIAS TRACTOR TYRES");
    expect(html).toContain("TR-1042");
    expect(html).toContain(
      'href="/products/agriculture/bias-tractor-tyres-tr-1042"',
    );
  });

  it("shows Tubes as a category whose data is still to come", async () => {
    const html = await get("/products/tubes");

    expect(html).toContain("Tubes");
    expect(html).toContain("Tubes Coming Soon");
  });

  it("404s an unknown category", async () => {
    const response = await fetch(`${BASE_URL}/products/not-a-category`);
    expect(response.status).toBe(404);
  });
});

describe("Pattern detail", () => {
  it("renders the Variant specification table with public fields only", async () => {
    const html = await get(
      "/products/agriculture/bias-tractor-tyres-tr-1042",
    );

    expect(html).toContain("BIAS TRACTOR TYRES");
    expect(html).toContain("TR-1042");
    expect(html).toContain("Specifications");

    for (const header of ["Size", "Ply rating", "TT/TL", "Application"]) {
      expect(html).toContain(header);
    }

    expect(html).toContain("6.00-16");
    expect(html).toContain("Tractor Front");
  });

  it("exposes no pricing or weight anywhere", async () => {
    const html = await get(
      "/products/agriculture/bias-tractor-tyres-tr-1042",
    );

    expect(html).not.toMatch(/fob/i);
    expect(html).not.toMatch(/usd/i);
    expect(html).not.toMatch(/\bprice\b/i);
  });

  it("404s an unknown pattern", async () => {
    const response = await fetch(
      `${BASE_URL}/products/agriculture/not-a-pattern`,
    );
    expect(response.status).toBe(404);
  });
});

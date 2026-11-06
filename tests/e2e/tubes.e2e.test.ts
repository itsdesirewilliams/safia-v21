import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PORT = 4323;
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

  await waitForServer(`${BASE_URL}/products/tubes`);
}, 120_000);

afterAll(() => {
  server?.kill();
});

async function get(path: string): Promise<string> {
  const response = await fetch(`${BASE_URL}${path}`);
  expect(response.status).toBe(200);
  return response.text();
}

describe("Tubes & Flaps catalogue", () => {
  it("keeps the existing /products/tubes URL and renders the interactive catalogue", async () => {
    const html = await get("/products/tubes");

    expect(html).toContain("Tubes &amp; Flaps");
    expect(html).toContain("Find a tube by size");
    expect(html).toContain("Agriculture &amp; OTR");
    expect(html).toContain("Utility Vehicles");
    expect(html).toContain("Flaps");
    expect(html).toContain("TR-13");
    expect(html).toContain("/assets/tubes/valves/tr-13.webp");
  });

  it("keeps the canonical URL on the Tubes category path", async () => {
    const html = await get("/products/tubes");
    expect(html).toContain('rel="canonical"');
    expect(html).toContain("/products/tubes");
  });
});

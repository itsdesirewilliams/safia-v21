import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { SLIDER_COLLECTIONS } from "@/lib/media/slider";
import { readSliderSlides } from "@/lib/media/slider-assets";

const PORT = 4313;
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

describe("slider assets deploy and serve", () => {
  it.each([...SLIDER_COLLECTIONS])(
    "%s artwork is reachable at every resolved ratio URL",
    async (collection) => {
      const slides = readSliderSlides(collection);
      expect(slides.length).toBeGreaterThan(0);

      for (const slide of slides) {
        for (const source of [slide.landscape, slide.portrait]) {
          expect(source).not.toBeNull();

          const response = await fetch(`${BASE_URL}${source}`);
          expect(response.status).toBe(200);
          expect(response.headers.get("content-type")).toMatch(/^image\//);
        }
      }
    },
  );

  it("keeps the catalogue and about-us routes resolving", async () => {
    for (const route of ["/catalogue", "/about-us"]) {
      const response = await fetch(`${BASE_URL}${route}`);
      expect(response.status).toBe(200);
    }
  });
});

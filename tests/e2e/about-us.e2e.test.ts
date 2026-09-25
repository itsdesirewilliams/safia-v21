import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PORT = 4319;
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

  await waitForServer(`${BASE_URL}/about-us`);
}, 120_000);

afterAll(() => {
  server?.kill();
});

async function getAboutHtml(): Promise<string> {
  const response = await fetch(`${BASE_URL}/about-us`);
  expect(response.status).toBe(200);
  return response.text();
}

describe("About Us page", () => {
  it("is a real page, not the placeholder", async () => {
    const html = await getAboutHtml();

    expect(html).toContain("About Safeway Tyre");
    expect(html).not.toContain("Placeholder — implemented by");
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  it("renders the company bio", async () => {
    const html = await getAboutHtml();

    expect(html).toContain("DEE RON Automotives LLP");
    expect(html).toContain("Punjab");
  });

  it("renders the Team section", async () => {
    const html = await getAboutHtml();

    expect(html).toContain("Meet the Team");
  });

  it("renders the Business Profile slider with prev/next controls", async () => {
    const html = await getAboutHtml();

    expect(html).toContain("Explore Business Profile");
    expect(html).toContain('aria-roledescription="carousel"');
    expect(html).toContain('aria-label="Previous slide"');
    expect(html).toContain('aria-label="Next slide"');
  });

  it("serves both ratios of the Business Profile artwork, never cropped", async () => {
    const html = await getAboutHtml();

    expect(html).toContain('media="(max-width: 767px)"');
    expect(html).toContain(
      "/assets/landscape/business-profile/business-profile-1.svg",
    );
    expect(html).toContain(
      "/assets/portrait/business-profile/business-profile-1.svg",
    );
    expect(html).not.toContain("object-fit");

    const portrait = await fetch(
      `${BASE_URL}/assets/portrait/business-profile/business-profile-1.svg`,
    );
    expect(portrait.status).toBe(200);
    expect(portrait.headers.get("content-type")).toMatch(/^image\//);
  });

  it("does not link out to the old website", async () => {
    const html = await getAboutHtml();

    expect(html).not.toContain('href="https://www.safewaytyre.com');
    expect(html).not.toContain('href="http://www.safewaytyre.com');
  });
});

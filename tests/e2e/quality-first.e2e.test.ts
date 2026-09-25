import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PORT = 4314;
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

  await waitForServer(`${BASE_URL}/quality-first`);
}, 120_000);

afterAll(() => {
  server?.kill();
});

async function getQualityFirstHtml(): Promise<string> {
  const response = await fetch(`${BASE_URL}/quality-first`);
  expect(response.status).toBe(200);
  return response.text();
}

describe("Quality First page structure", () => {
  it("renders the hero and the three fixed sections in order", async () => {
    const html = await getQualityFirstHtml();

    expect(html).toContain("Quality Is a Process, Not a Promise.");
    expect(html).toContain("Stories from the Testing Floor");
    expect(html).toContain("How Quality Is Built In");
    expect(html).toContain("The Machines Behind the Testing");

    const storiesIndex = html.indexOf('id="stories"');
    const explanationIndex = html.indexOf("How Quality Is Built In");
    const machinesIndex = html.indexOf('id="machines"');

    expect(storiesIndex).toBeGreaterThan(-1);
    expect(explanationIndex).toBeGreaterThan(storiesIndex);
    expect(machinesIndex).toBeGreaterThan(explanationIndex);
  });

  it("uses a single semantic h1 and developer-owned internal links", async () => {
    const html = await getQualityFirstHtml();

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('href="/catalogue"');
    expect(html).toContain('href="/contact-us"');
    expect(html).toContain('href="/about-us"');
    expect(html).toContain('href="/warranty"');
  });

  it("renders labelled empty states when no media has been supplied", async () => {
    const html = await getQualityFirstHtml();

    expect(html).toContain("Testing Videos Coming Soon");
    expect(html).toContain("Machine Images Coming Soon");
  });

  it("does not open a video dialog before a story is selected", async () => {
    const html = await getQualityFirstHtml();

    expect(html).not.toContain('role="dialog"');
  });
});

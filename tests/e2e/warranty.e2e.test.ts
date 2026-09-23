import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PORT = 4316;
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

  await waitForServer(`${BASE_URL}/warranty`);
}, 120_000);

afterAll(() => {
  server?.kill();
});

async function getWarrantyHtml(): Promise<string> {
  const response = await fetch(`${BASE_URL}/warranty`);
  expect(response.status).toBe(200);
  return response.text();
}

describe("Warranty page", () => {
  it("is a real page, not the placeholder", async () => {
    const html = await getWarrantyHtml();

    expect(html).toContain("Warranty Policy");
    expect(html).not.toContain("Placeholder — implemented by");
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  it("renders the eight policy sections in order", async () => {
    const html = await getWarrantyHtml();

    const headings = [
      "Definitions",
      "Applicability",
      "Warranty Coverage",
      "Warranty Terms by Category",
      "Exclusions",
      "Claim Procedure",
      "Limitation of Liability",
      "Governing Law",
    ];

    let previous = -1;
    for (const heading of headings) {
      const index = html.indexOf(heading);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
  });

  it("preserves the policy's legal phrases", async () => {
    const html = await getWarrantyHtml();

    expect(html).toContain("two (2) years from date of manufacture");
    expect(html).toContain("eighty-five percent (85%)");
    expect(html).toContain("tread wear indicator (TWI)");
    expect(html).toContain("twenty-one (21) days");
    expect(html).toContain("Republic of India");
  });

  it("links back to Products, Quality First, Contact Us and Catalogue", async () => {
    const html = await getWarrantyHtml();

    expect(html).toContain('href="/quality-first"');
    expect(html).toContain('href="/contact-us"');
    expect(html).toContain('href="/catalogue"');
    expect(html).toContain('href="/products/motorcycle"');
    expect(html).toContain('href="/products/truck-bus"');
  });

  it("provides table-of-contents anchors for every section", async () => {
    const html = await getWarrantyHtml();

    for (const id of [
      "definitions",
      "applicability",
      "coverage",
      "terms-by-category",
      "exclusions",
      "claim-procedure",
      "limitation-of-liability",
      "governing-law",
    ]) {
      expect(html).toContain(`href="#${id}"`);
      expect(html).toContain(`id="${id}"`);
    }
  });

  it("does not link out to the old website", async () => {
    const html = await getWarrantyHtml();

    expect(html).not.toContain('href="https://www.safewaytyre.com');
    expect(html).not.toContain('href="http://www.safewaytyre.com');
  });
});

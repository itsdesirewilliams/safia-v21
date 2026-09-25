import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { CATEGORIES } from "@/lib/catalogue/categories";
import { SITE } from "@/lib/site";

const PORT = 4315;
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

  await waitForServer(`${BASE_URL}/contact-us`);
}, 120_000);

afterAll(() => {
  server?.kill();
});

async function getContactHtml(): Promise<string> {
  const response = await fetch(`${BASE_URL}/contact-us`);
  expect(response.status).toBe(200);
  return response.text();
}

describe("Contact Us page", () => {
  it("renders the hero and both form tabs", async () => {
    const html = await getContactHtml();

    expect(html).toMatch(/Let.s Talk\./);
    expect(html).toContain('role="tablist"');
    expect(html).toContain("Query / Enquiry");
    expect(html).toContain("Feedback");
  });

  it("renders the query form fields and the canonical categories", async () => {
    const html = await getContactHtml();

    for (const id of [
      "query-name",
      "query-country",
      "query-phone",
      "query-category",
      "query-message",
    ]) {
      expect(html).toContain(`id="${id}"`);
    }

    for (const category of CATEGORIES) {
      expect(html).toContain(`value="${category.slug}"`);
    }
  });

  it("renders the simpler feedback form without a category", async () => {
    const html = await getContactHtml();

    for (const id of [
      "feedback-name",
      "feedback-country",
      "feedback-phone",
      "feedback-message",
    ]) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).not.toContain('id="feedback-category"');
  });

  it("shows the approved contact details and WhatsApp CTA", async () => {
    const html = await getContactHtml();

    expect(html).toContain("Director@safewaytyre.com");
    expect(html).toContain("marketing01@safewaytyre.com");
    expect(html).toContain(SITE.phone.primary);
    expect(html).toContain(SITE.whatsappUrl);
  });

  it("embeds the approved office map when an address is configured", async () => {
    const html = await getContactHtml();
    const { NEXT_PUBLIC_COMPANY_ADDRESS } = loadDotEnvLocal();

    if (NEXT_PUBLIC_COMPANY_ADDRESS) {
      expect(html).toContain("google.com/maps");
      expect(html).toContain("output=embed");
    } else {
      expect(html).toContain("Map Coming Soon");
    }
  });

  it("does not open a form with browser-only validation", async () => {
    const html = await getContactHtml();

    // Server actions are wired, and validation is server-side; the forms opt
    // out of native validation so the server is the authority.
    expect(html.toLowerCase()).toContain("novalidate");
  });
});

describe("Homepage Query form reuse", () => {
  it("uses the same Query form implementation as Contact Us", async () => {
    const response = await fetch(`${BASE_URL}/`);
    expect(response.status).toBe(200);
    const html = await response.text();

    expect(html).toContain('id="query-name"');
    expect(html).toContain('id="query-category"');
    expect(html).toContain("Send Enquiry");
  });
});

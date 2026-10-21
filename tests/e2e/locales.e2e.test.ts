import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { LOCALE_META, LOCALE_ORDER } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/dictionaries/en";

const PORT = 4322;
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

describe("localized routes", () => {
  it.each([...LOCALE_ORDER])(
    "serves /%s in that language with the right direction",
    async (locale) => {
      const path = locale === "en" ? "/" : `/${locale}/`;
      const response = await fetch(`${BASE_URL}${path}`);
      expect(response.status, locale).toBe(200);

      const html = await response.text();
      const meta = LOCALE_META[locale];

      // The document language and direction follow the active locale.
      expect(html, locale).toContain(`lang="${locale}"`);
      expect(html, locale).toContain(`dir="${meta.dir}"`);

      // The page is translated: the English hero copy is gone.
      if (locale !== "en") {
        expect(html, locale).not.toContain(en.home.heroTitle);
      }

      // The language is remembered for the next visit.
      expect(response.headers.get("set-cookie"), locale).toContain(
        `NEXT_LOCALE=${locale}`,
      );
    },
  );

  it("keeps the chosen language when moving between pages", async () => {
    const response = await fetch(`${BASE_URL}/fr/about-us`);
    expect(response.status).toBe(200);

    const html = await response.text();
    expect(html).toContain('lang="fr"');
    // The navigation points at the French routes, not the English ones.
    expect(html).toContain('href="/fr/catalogue"');
    expect(html).toContain('href="/fr/contact-us"');
  });

  it("sends a returning visitor to the language they chose", async () => {
    const response = await fetch(`${BASE_URL}/`, {
      headers: { cookie: "NEXT_LOCALE=sw" },
      redirect: "manual",
    });

    expect([302, 307, 308]).toContain(response.status);
    expect(response.headers.get("location") ?? "").toContain("/sw");
  });

  it("redirects the prefixed English URL to the canonical one", async () => {
    const response = await fetch(`${BASE_URL}/en/about-us`, {
      redirect: "manual",
    });

    expect(response.status).toBe(308);
    expect(response.headers.get("location") ?? "").toContain("/about-us");
  });
});

describe("language selector markup", () => {
  it("shows the compact code and the reference-country flag in the header", async () => {
    const html = await (await fetch(`${BASE_URL}/`)).text();

    const meta = LOCALE_META.en;
    expect(html).toContain(meta.short);
    expect(html).toContain(`data-country-flag="${meta.countryCode}"`);
    // The dropdown opens on the client; the trigger is always server-rendered.
    expect(html).toContain('aria-haspopup="listbox"');
    // Flags are SVG images, never emoji.
    expect(html).not.toMatch(/[\u{1F1E6}-\u{1F1FF}]{2}/u);
    expect(html).toContain("<svg");
  });

  it("shows the flag of the reference country on every localized page", async () => {
    for (const locale of LOCALE_ORDER) {
      const path = locale === "en" ? "/" : `/${locale}/`;
      const html = await (await fetch(`${BASE_URL}${path}`)).text();
      expect(html, locale).toContain(
        `data-country-flag="${LOCALE_META[locale].countryCode}"`,
      );
      expect(html, locale).toContain(LOCALE_META[locale].short);
    }
  });
});

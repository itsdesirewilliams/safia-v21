import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PRIMARY_NAV, SMOKE_ROUTES } from "@/lib/routes";

const PORT = 4321;
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

describe("every routing-map route resolves", () => {
  it.each([...SMOKE_ROUTES])("%s returns 200", async (route) => {
    const response = await fetch(`${BASE_URL}${route}`);
    expect(response.status).toBe(200);
  });
});

describe("global shell", () => {
  it("renders the header navigation on every page", async () => {
    const response = await fetch(`${BASE_URL}/`);
    const html = await response.text();

    for (const item of PRIMARY_NAV) {
      expect(html).toContain(item.label);
    }
  });

  it("renders the footer contact details, hours and key links", async () => {
    const response = await fetch(`${BASE_URL}/`);
    const html = await response.text();

    expect(html).toContain("Director@safewaytyre.com");
    expect(html).toContain("Monday");
    expect(html).toContain("9:00 AM");
    expect(html).toContain("/gallery");
  });

  it("lists all seven category links in the Products dropdown", async () => {
    const response = await fetch(`${BASE_URL}/`);
    const html = await response.text();

    for (const category of [
      "motorcycle",
      "three-wheeler",
      "truck-bus",
      "agriculture",
      "otr",
      "forklift",
      "tubes",
    ]) {
      expect(html).toContain(`/products/${category}`);
    }
  });

  it("wires the existing Safeway Tyre brand favicons from public/brand", async () => {
    const response = await fetch(`${BASE_URL}/`);
    const html = await response.text();

    expect(html).toContain('rel="icon"');
    expect(html).toContain("/brand/favicon.ico");
    expect(html).toContain("/brand/favicon-16x16.png");
    expect(html).toContain("/brand/favicon-32x32.png");
    expect(html).toContain("/brand/apple-touch-icon.png");
    expect(html).toContain("/brand/site.webmanifest");
  });

  it("serves the brand icon files and the manifest", async () => {
    for (const path of [
      "/brand/favicon.ico",
      "/brand/favicon-16x16.png",
      "/brand/favicon-32x32.png",
      "/brand/apple-touch-icon.png",
      "/brand/android-chrome-192x192.png",
      "/brand/android-chrome-512x512.png",
    ]) {
      const res = await fetch(`${BASE_URL}${path}`);
      expect(res.status, path).toBe(200);
    }

    const manifest = (await (
      await fetch(`${BASE_URL}/brand/site.webmanifest`)
    ).json()) as { name: string; icons: { src: string }[] };

    expect(manifest.name).toBe("Safeway Tyre");
    expect(manifest.icons.map((icon) => icon.src)).toEqual([
      "/brand/android-chrome-192x192.png",
      "/brand/android-chrome-512x512.png",
    ]);
  });
});

describe("Supabase connection", () => {
  it("reports connected with all six buckets present", async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      supabase: string;
      buckets: { missing: string[] };
    };

    expect(body.supabase).toBe("connected");
    expect(body.buckets.missing).toEqual([]);
  });
});

describe("admin routes are protected server-side", () => {
  it("redirects signed-out visitors from /admin/files to the login screen", async () => {
    const response = await fetch(`${BASE_URL}/admin/files`, {
      redirect: "manual",
    });

    expect([302, 303, 307, 308]).toContain(response.status);
    expect(response.headers.get("location") ?? "").toContain("/admin/login");
  });

  it("redirects signed-out visitors from the Pattern Image uploader", async () => {
    const response = await fetch(`${BASE_URL}/admin/pattern-images`, {
      redirect: "manual",
    });

    expect([302, 303, 307, 308]).toContain(response.status);
    expect(response.headers.get("location") ?? "").toContain("/admin/login");
  });

  it("redirects the legacy /admin/media route to the login screen too", async () => {
    const response = await fetch(`${BASE_URL}/admin/media`, {
      redirect: "manual",
    });

    expect([302, 303, 307, 308]).toContain(response.status);
    expect(response.headers.get("location") ?? "").toContain("/admin/login");
  });

  it("redirects signed-out visitors from the admin root", async () => {
    const response = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
    expect([302, 303, 307, 308]).toContain(response.status);
    expect(response.headers.get("location") ?? "").toContain("/admin/login");
  });

  it("does not render the file manager to signed-out visitors", async () => {
    const response = await fetch(`${BASE_URL}/admin/files`, {
      redirect: "manual",
    });
    const body = response.headers.get("location") ? "" : await response.text();
    expect(body).not.toContain("Supabase-managed files");
  });

  it("serves the sign-in page", async () => {
    const response = await fetch(`${BASE_URL}/admin/login`);
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Sign in to manage media");
  });
});

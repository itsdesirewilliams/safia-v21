import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PORT = 4320;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const OLD_PATH = "e2e/gallery-fixture-old.png";
const NEW_PATH = "e2e/gallery-fixture-new.png";

const OLD_CAPTION = "E2E Gallery Caption";
const OLD_ALT = "E2E Gallery Alt";
const NEW_ALT = "E2E Default Caption Alt";

// A 1x1 transparent PNG.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

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

const ENV = { ...process.env, ...loadDotEnvLocal() };

let server: ChildProcess | undefined;
let admin: SupabaseClient | undefined;

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

async function cleanup() {
  if (!admin) {
    return;
  }
  await admin
    .from("media")
    .delete()
    .eq("bucket", "gallery")
    .in("storage_path", [OLD_PATH, NEW_PATH]);
  await admin.storage.from("gallery").remove([OLD_PATH, NEW_PATH]);
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
    env: ENV,
    stdio: "pipe",
  });

  await waitForServer(`${BASE_URL}/gallery`);

  const url = ENV.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = ENV.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "The gallery e2e test needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await cleanup();

  // Upload the older object first, then the newer one, so storage creation
  // time orders them newest-first on the page.
  const oldUpload = await admin.storage
    .from("gallery")
    .upload(OLD_PATH, PNG, { contentType: "image/png", upsert: true });
  if (oldUpload.error) {
    throw new Error(`Could not seed the old image: ${oldUpload.error.message}`);
  }

  const oldMedia = await admin.from("media").insert({
    bucket: "gallery",
    storage_path: OLD_PATH,
    type: "image",
    mime_type: "image/png",
    caption: OLD_CAPTION,
    alt: OLD_ALT,
  });
  if (oldMedia.error) {
    throw new Error(`Could not seed the old media: ${oldMedia.error.message}`);
  }

  const newUpload = await admin.storage
    .from("gallery")
    .upload(NEW_PATH, PNG, { contentType: "image/png", upsert: true });
  if (newUpload.error) {
    throw new Error(`Could not seed the new image: ${newUpload.error.message}`);
  }

  // No caption: the page must fall back to "Safeway Tyre".
  const newMedia = await admin.from("media").insert({
    bucket: "gallery",
    storage_path: NEW_PATH,
    type: "image",
    mime_type: "image/png",
    caption: null,
    alt: NEW_ALT,
  });
  if (newMedia.error) {
    throw new Error(`Could not seed the new media: ${newMedia.error.message}`);
  }
}, 120_000);

afterAll(async () => {
  await cleanup();
  server?.kill();
});

async function getGalleryHtml(): Promise<string> {
  const response = await fetch(`${BASE_URL}/gallery`);
  expect(response.status).toBe(200);
  return response.text();
}

describe("Gallery page", () => {
  it("is a real page, not the placeholder", async () => {
    const html = await getGalleryHtml();

    expect(html).toContain("Gallery");
    expect(html).not.toContain("Placeholder — implemented by");
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  it("renders a regular responsive grid, not a masonry layout", async () => {
    const html = await getGalleryHtml();

    expect(html).toContain("grid-cols-2");
    expect(html).toContain("sm:grid-cols-3");
    expect(html).toContain("lg:grid-cols-4");
    expect(html).not.toContain("columns-");
    expect(html).not.toContain("break-inside-avoid");
  });

  it("discovers the seeded images newest first", async () => {
    const html = await getGalleryHtml();

    const newer = html.indexOf("/gallery/e2e/gallery-fixture-new.png");
    const older = html.indexOf("/gallery/e2e/gallery-fixture-old.png");

    expect(newer).toBeGreaterThan(-1);
    expect(older).toBeGreaterThan(-1);
    expect(newer).toBeLessThan(older);
  });

  it("uses Media caption/alt, defaulting the caption to Safeway Tyre", async () => {
    const html = await getGalleryHtml();

    expect(html).toContain(OLD_CAPTION);
    expect(html).toContain(OLD_ALT);
    expect(html).toContain(NEW_ALT);
    expect(html).toContain(': Safeway Tyre"');
  });

  it("opens no viewer before an image is selected", async () => {
    const html = await getGalleryHtml();

    expect(html).not.toContain('role="dialog"');
  });

  it("serves the seeded image from public storage", async () => {
    const url = `${ENV.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${NEW_PATH}`;
    const image = await fetch(url);
    expect(image.status).toBe(200);
    expect(image.headers.get("content-type")).toMatch(/^image\//);
  });
});

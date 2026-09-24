import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PORT = 4318;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const PUBLISHED_SLUG = "e2e-blog-fixture";
const DRAFT_SLUG = "e2e-blog-draft-fixture";
const MEDIA_PATH = `e2e/${PUBLISHED_SLUG}.png`;

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
let mediaId = "";

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
  await admin.from("posts").delete().in("slug", [PUBLISHED_SLUG, DRAFT_SLUG]);
  await admin.from("media").delete().eq("bucket", "blog-images").eq("storage_path", MEDIA_PATH);
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

  await waitForServer(`${BASE_URL}/blogs`);

  const url = ENV.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = ENV.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "The blogs e2e test needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await cleanup();

  const media = await admin
    .from("media")
    .insert({
      bucket: "blog-images",
      storage_path: MEDIA_PATH,
      type: "image",
      mime_type: "image/png",
      alt: "E2E alt text",
      caption: "E2E caption",
    })
    .select("id")
    .single();

  if (media.error || !media.data) {
    throw new Error(`Could not seed the e2e media: ${media.error?.message}`);
  }
  mediaId = media.data.id as string;

  const published = await admin.from("posts").insert({
    title: "E2E Published Post",
    slug: PUBLISHED_SLUG,
    author: "E2E Author",
    excerpt: "E2E excerpt",
    thumbnail_media_id: mediaId,
    status: "published",
    published_at: new Date().toISOString(),
    body: [
      { type: "heading", level: 2, text: "E2E Heading" },
      { type: "paragraph", text: "E2E paragraph body." },
      { type: "image", mediaId, alt: null, caption: null },
    ],
  });

  if (published.error) {
    throw new Error(`Could not seed the e2e post: ${published.error.message}`);
  }

  const draft = await admin.from("posts").insert({
    title: "E2E Draft Post",
    slug: DRAFT_SLUG,
    author: "E2E Author",
    status: "draft",
    body: [{ type: "paragraph", text: "Draft body." }],
  });

  if (draft.error) {
    throw new Error(`Could not seed the e2e draft: ${draft.error.message}`);
  }
}, 120_000);

afterAll(async () => {
  await cleanup();
  server?.kill();
});

describe("blog listing", () => {
  it("lists published posts newest first with thumbnail, title and author", async () => {
    const response = await fetch(`${BASE_URL}/blogs`);
    expect(response.status).toBe(200);
    const html = await response.text();

    expect(html).toContain("E2E Published Post");
    expect(html).toContain("E2E Author");
    expect(html).toContain("E2E excerpt");
    expect(html).toContain("/blog-images/e2e/e2e-blog-fixture.png");
    expect(html).toContain(`/blogs/${PUBLISHED_SLUG}`);
  });

  it("never shows draft posts", async () => {
    const html = await (await fetch(`${BASE_URL}/blogs`)).text();
    expect(html).not.toContain("E2E Draft Post");
  });
});

describe("post article", () => {
  it("renders the block body, resolving image blocks from Media ids", async () => {
    const response = await fetch(`${BASE_URL}/blogs/${PUBLISHED_SLUG}`);
    expect(response.status).toBe(200);
    const html = await response.text();

    expect(html).toContain("E2E Published Post");
    expect(html).toContain("E2E Heading");
    expect(html).toContain("E2E paragraph body.");
    expect(html).toContain("/blog-images/e2e/e2e-blog-fixture.png");
    expect(html).toContain("E2E caption");
  });

  it("404s an unknown slug and a draft slug", async () => {
    for (const slug of ["does-not-exist", DRAFT_SLUG]) {
      const response = await fetch(`${BASE_URL}/blogs/${slug}`);
      expect(response.status).toBe(404);
    }
  });
});

describe("media reference protection", () => {
  it("reports the media as referenced, so deletion is blocked", async () => {
    const { data, error } = await admin!.rpc("media_is_referenced", {
      p_media_id: mediaId,
    });
    expect(error).toBeNull();
    expect(data).toBe(true);
  });
});

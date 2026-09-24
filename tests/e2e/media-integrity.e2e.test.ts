import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

/**
 * Live integrity checks for the Media layer (Ticket 4). These exercise the
 * real Supabase project: public read, RLS on writes, and the role split
 * (admin/editor). Cleanup removes every record and user created here.
 */

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

const env = loadDotEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const configured = Boolean(url && anonKey && serviceKey);
const describeLive = configured ? describe : describe.skip;

const admin = createClient(url ?? "", serviceKey ?? "", {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(url ?? "", anonKey ?? "", {
  auth: { persistSession: false, autoRefreshToken: false },
});

const createdMedia: string[] = [];
const createdUsers: string[] = [];
const uploadedObjects: { bucket: string; path: string }[] = [];

function pngBytes(): Blob {
  // A valid 1x1 PNG is unnecessary here; the storage layer only needs bytes.
  return new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], {
    type: "image/png",
  });
}

async function createMediaRow(): Promise<{ id: string }> {
  const { data, error } = await admin
    .from("media")
    .insert({
      bucket: "gallery",
      storage_path: `e2e/${crypto.randomUUID()}.png`,
      type: "image",
      mime_type: "image/png",
      alt: "E2E alt text",
      caption: "E2E caption",
      uploaded_by: null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw error ?? new Error("Could not create the media fixture.");
  }

  createdMedia.push(data.id);
  return data;
}

async function createSignedInUser(
  role: "admin" | "editor" | null,
): Promise<{ client: SupabaseClient; userId: string }> {
  const email = `e2e-${role ?? "none"}-${Date.now()}-${Math.floor(
    Math.random() * 1_000_000,
  )}@example.com`;
  const password = crypto.randomUUID();

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (created.error || !created.data.user) {
    throw created.error ?? new Error("Could not create the test user.");
  }

  const userId = created.data.user.id;
  createdUsers.push(userId);

  if (role) {
    const profile = await admin
      .from("profiles")
      .upsert({ id: userId, email, role });
    if (profile.error) {
      throw profile.error;
    }
  }

  const client = createClient(url as string, anonKey as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (signIn.error) {
    throw signIn.error;
  }

  return { client, userId };
}

afterAll(async () => {
  if (!configured) {
    return;
  }
  for (const object of uploadedObjects) {
    await admin.storage.from(object.bucket).remove([object.path]);
  }
  for (const id of createdMedia) {
    await admin.from("media").delete().eq("id", id);
  }
  for (const id of createdUsers) {
    await admin.auth.admin.deleteUser(id);
  }
});

describeLive("media layer integrity (live Supabase)", () => {
  it("creates a Media record that the public can read", async () => {
    const row = await createMediaRow();

    const { data, error } = await anon
      .from("media")
      .select("id, bucket, storage_path, alt, caption")
      .eq("id", row.id)
      .maybeSingle();

    expect(error).toBeNull();
    expect(data?.id).toBe(row.id);
    expect(data?.alt).toBe("E2E alt text");
  });

  it("refuses anonymous inserts", async () => {
    const { error } = await anon.from("media").insert({
      bucket: "gallery",
      storage_path: `e2e/${crypto.randomUUID()}.png`,
      type: "image",
    });

    expect(error).not.toBeNull();
  });

  it("refuses anonymous deletes", async () => {
    const row = await createMediaRow();

    await anon.from("media").delete().eq("id", row.id);

    const { data } = await admin
      .from("media")
      .select("id")
      .eq("id", row.id)
      .maybeSingle();
    expect(data?.id).toBe(row.id);
  });

  it("refuses a signed-in user with no role", async () => {
    const { client } = await createSignedInUser(null);

    const { error } = await client.from("media").insert({
      bucket: "gallery",
      storage_path: `e2e/${crypto.randomUUID()}.png`,
      type: "image",
      uploaded_by: null,
    });

    expect(error).not.toBeNull();
  });

  it("lets an editor upload but not delete", async () => {
    const { client, userId } = await createSignedInUser("editor");

    const insert = await client
      .from("media")
      .insert({
        bucket: "blog-images",
        storage_path: `e2e/${crypto.randomUUID()}.png`,
        type: "image",
        uploaded_by: userId,
      })
      .select("id")
      .single();

    expect(insert.error).toBeNull();
    const mediaId = insert.data?.id as string;
    createdMedia.push(mediaId);

    await client.from("media").delete().eq("id", mediaId);

    const { data } = await admin
      .from("media")
      .select("id")
      .eq("id", mediaId)
      .maybeSingle();
    expect(data?.id).toBe(mediaId);
  });

  it("refuses an editor writing a Media record to the restricted gallery bucket", async () => {
    const { client, userId } = await createSignedInUser("editor");

    const { error } = await client.from("media").insert({
      bucket: "gallery",
      storage_path: `e2e/${crypto.randomUUID()}.png`,
      type: "image",
      uploaded_by: userId,
    });

    expect(error).not.toBeNull();
  });

  it("lets an admin delete media", async () => {
    const { client } = await createSignedInUser("admin");
    const row = await createMediaRow();

    const deleted = await client
      .from("media")
      .delete()
      .eq("id", row.id)
      .select("id");

    expect(deleted.error).toBeNull();
    expect(deleted.data?.length).toBe(1);

    const { data } = await admin
      .from("media")
      .select("id")
      .eq("id", row.id)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("lets an editor upload a storage object", async () => {
    const { client, userId } = await createSignedInUser("editor");
    const path = `e2e/${crypto.randomUUID()}.png`;

    const upload = await client.storage
      .from("blog-images")
      .upload(path, pngBytes(), { contentType: "image/png" });
    expect(upload.error).toBeNull();
    uploadedObjects.push({ bucket: "blog-images", path });

    const record = await client
      .from("media")
      .insert({
        bucket: "blog-images",
        storage_path: path,
        type: "image",
        mime_type: "image/png",
        uploaded_by: userId,
      })
      .select("id")
      .single();

    expect(record.error).toBeNull();
    if (record.data?.id) {
      createdMedia.push(record.data.id);
    }
  });

  it("refuses an editor uploading a storage object to the restricted gallery bucket", async () => {
    const { client } = await createSignedInUser("editor");
    const path = `e2e/${crypto.randomUUID()}.png`;

    const { error } = await client.storage
      .from("gallery")
      .upload(path, pngBytes(), { contentType: "image/png" });

    expect(error).not.toBeNull();
  });

  it("refuses anonymous storage uploads", async () => {
    const path = `e2e/${crypto.randomUUID()}.png`;
    const { error } = await anon.storage
      .from("gallery")
      .upload(path, pngBytes(), { contentType: "image/png" });
    expect(error).not.toBeNull();
  });

  it("refuses storage uploads from a signed-in user with no role", async () => {
    const { client } = await createSignedInUser(null);
    const path = `e2e/${crypto.randomUUID()}.png`;
    const { error } = await client.storage
      .from("gallery")
      .upload(path, pngBytes(), { contentType: "image/png" });
    expect(error).not.toBeNull();
  });

  it("supports the admin media-library query shape", async () => {
    const term = "tyre";
    const { error } = await anon
      .from("media")
      .select("id, caption")
      .or(
        [
          `caption.ilike.%${term}%`,
          `alt.ilike.%${term}%`,
          `pattern_code.ilike.%${term}%`,
          `storage_path.ilike.%${term}%`,
        ].join(","),
      )
      .order("created_at", { ascending: false })
      .limit(10);

    expect(error).toBeNull();
  });

  it("matches the bucket and type filters the admin uses", async () => {
    const { error } = await anon
      .from("media")
      .select("id")
      .eq("bucket", "gallery")
      .eq("type", "image")
      .limit(5);

    expect(error).toBeNull();
  });

  it("reports no references while the Posts table does not exist", async () => {
    const row = await createMediaRow();

    const referenced = await admin.rpc("media_is_referenced", {
      p_media_id: row.id,
    });
    expect(referenced.error).toBeNull();
    expect(referenced.data).toBe(false);

    const references = await admin.rpc("media_references", {
      p_media_id: row.id,
    });
    expect(references.error).toBeNull();
    expect(references.data).toEqual([]);
  });
});

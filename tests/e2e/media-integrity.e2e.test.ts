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
  role: "admin" | "operator" | "copywriter" | null,
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

  it("lets an operator upload and delete media", async () => {
    const { client, userId } = await createSignedInUser("operator");

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

    const deleted = await client
      .from("media")
      .delete()
      .eq("id", mediaId)
      .select("id");
    expect(deleted.error).toBeNull();
    expect(deleted.data?.length).toBe(1);
  });

  it("lets a copywriter write to blog-images but not to gallery", async () => {
    const { client, userId } = await createSignedInUser("copywriter");

    const allowed = await client
      .from("media")
      .insert({
        bucket: "blog-images",
        storage_path: `e2e/${crypto.randomUUID()}.png`,
        type: "image",
        uploaded_by: userId,
      })
      .select("id")
      .single();
    expect(allowed.error).toBeNull();
    if (allowed.data?.id) {
      createdMedia.push(allowed.data.id);
    }

    const refused = await client.from("media").insert({
      bucket: "gallery",
      storage_path: `e2e/${crypto.randomUUID()}.png`,
      type: "image",
      uploaded_by: userId,
    });
    expect(refused.error).not.toBeNull();
  });

  it("lets an operator manage the restricted gallery bucket", async () => {
    const { client, userId } = await createSignedInUser("operator");

    const created = await client
      .from("media")
      .insert({
        bucket: "gallery",
        storage_path: `e2e/${crypto.randomUUID()}.png`,
        type: "image",
        uploaded_by: userId,
      })
      .select("id")
      .single();

    expect(created.error).toBeNull();
    if (created.data?.id) {
      createdMedia.push(created.data.id);
    }
  });

  it("lets an admin upload a gallery object and create its Media record", async () => {
    const { client, userId } = await createSignedInUser("admin");
    const path = `e2e/${crypto.randomUUID()}.png`;

    const upload = await client.storage
      .from("gallery")
      .upload(path, pngBytes(), { contentType: "image/png" });
    expect(upload.error).toBeNull();
    uploadedObjects.push({ bucket: "gallery", path });

    const record = await client
      .from("media")
      .insert({
        bucket: "gallery",
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

  it("lets an admin save a gallery caption (missing → captioned)", async () => {
    const { client, userId } = await createSignedInUser("admin");
    const path = `e2e/${crypto.randomUUID()}.png`;

    await client.storage
      .from("gallery")
      .upload(path, pngBytes(), { contentType: "image/png" });
    uploadedObjects.push({ bucket: "gallery", path });

    const created = await client
      .from("media")
      .insert({
        bucket: "gallery",
        storage_path: path,
        type: "image",
        mime_type: "image/png",
        uploaded_by: userId,
        caption: null,
      })
      .select("id")
      .single();

    expect(created.error).toBeNull();
    const id = created.data?.id as string;
    createdMedia.push(id);

    const updated = await client
      .from("media")
      .update({ caption: "A saved caption" })
      .eq("id", id)
      .select("caption")
      .single();

    expect(updated.error).toBeNull();
    expect(updated.data?.caption).toBe("A saved caption");
  });

  it("processes a multi-file gallery batch with mixed formats (bulk-upload contract)", async () => {
    const { client, userId } = await createSignedInUser("admin");

    const formats = [
      { ext: "png", mime: "image/png" },
      { ext: "jpg", mime: "image/jpeg" },
      { ext: "webp", mime: "image/webp" },
      { ext: "png", mime: "image/png" },
      { ext: "jpeg", mime: "image/jpeg" },
    ];

    const ids: string[] = [];

    for (const format of formats) {
      const path = `e2e/${crypto.randomUUID()}.${format.ext}`;

      const upload = await client.storage
        .from("gallery")
        .upload(path, pngBytes(), { contentType: format.mime });
      expect(upload.error).toBeNull();
      uploadedObjects.push({ bucket: "gallery", path });

      const record = await client
        .from("media")
        .insert({
          bucket: "gallery",
          storage_path: path,
          type: "image",
          mime_type: format.mime,
          uploaded_by: userId,
          caption: null,
        })
        .select("id")
        .single();

      expect(record.error).toBeNull();
      if (record.data?.id) {
        createdMedia.push(record.data.id);
        ids.push(record.data.id);
      }
    }

    expect(ids).toHaveLength(formats.length);

    // Every batch item is created with a null caption, so it surfaces under the
    // Missing Caption workflow.
    const { data, error } = await anon
      .from("media")
      .select("id")
      .in("id", ids)
      .is("caption", null);
    expect(error).toBeNull();
    expect(data).toHaveLength(formats.length);
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

  it("lets an operator upload a storage object", async () => {
    const { client, userId } = await createSignedInUser("operator");
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

  it("lets a copywriter upload to blog-images storage but not to gallery", async () => {
    const { client } = await createSignedInUser("copywriter");

    const allowedPath = `e2e/${crypto.randomUUID()}.png`;
    const allowed = await client.storage
      .from("blog-images")
      .upload(allowedPath, pngBytes(), { contentType: "image/png" });
    expect(allowed.error).toBeNull();
    uploadedObjects.push({ bucket: "blog-images", path: allowedPath });

    const refusedPath = `e2e/${crypto.randomUUID()}.png`;
    const refused = await client.storage
      .from("gallery")
      .upload(refusedPath, pngBytes(), { contentType: "image/png" });
    expect(refused.error).not.toBeNull();
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

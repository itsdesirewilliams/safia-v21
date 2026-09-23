// Bootstrap the first admin for the Safeway Tyre custom admin (Ticket 4).
//
// Creates (or updates) a Supabase Auth user and grants them the `admin` role in
// public.profiles. Uses the service-role key, so run it locally only.
//
//   ADMIN_EMAIL=you@safewaytyre.com ADMIN_PASSWORD='...' node scripts/create-admin.mjs
//
// Password is never printed. Re-run to rotate an existing admin's password.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

function loadDotEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    const env = {};
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

const env = { ...loadDotEnvLocal(), ...process.env };

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const email = env.ADMIN_EMAIL;
const password = env.ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env.local).",
  );
  process.exit(1);
}

if (!email || !password) {
  console.error(
    "Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' node scripts/create-admin.mjs",
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("Choose a password of at least 8 characters.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const existing = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (existing.error) {
  console.error(`Could not list users: ${existing.error.message}`);
  process.exit(1);
}

const match = existing.data.users.find(
  (user) => user.email?.toLowerCase() === email.toLowerCase(),
);

let userId = match?.id;

if (userId) {
  const updated = await supabase.auth.admin.updateUserById(userId, { password });
  if (updated.error) {
    console.error(`Could not update the user: ${updated.error.message}`);
    process.exit(1);
  }
} else {
  const created = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (created.error || !created.data.user) {
    console.error(
      `Could not create the user: ${created.error?.message ?? "unknown error"}`,
    );
    process.exit(1);
  }
  userId = created.data.user.id;
}

const profile = await supabase
  .from("profiles")
  .upsert({ id: userId, email, role: "admin" });

if (profile.error) {
  console.error(`Could not grant the admin role: ${profile.error.message}`);
  process.exit(1);
}

console.log(`Admin ready: ${email} (role: admin). Sign in at /admin/login.`);

import { NextResponse } from "next/server";

import { ConfigError } from "@/lib/config";
import { STORAGE_BUCKET_IDS } from "@/lib/supabase/buckets";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      throw error;
    }

    const existing = new Set((data ?? []).map((bucket) => bucket.name));
    const missing = STORAGE_BUCKET_IDS.filter((id) => !existing.has(id));

    return NextResponse.json({
      status: missing.length === 0 ? "ok" : "degraded",
      supabase: "connected",
      buckets: {
        expected: STORAGE_BUCKET_IDS,
        missing,
      },
    });
  } catch (error) {
    const message =
      error instanceof ConfigError
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);

    return NextResponse.json(
      { status: "error", supabase: "unconfigured", message },
      { status: 503 },
    );
  }
}

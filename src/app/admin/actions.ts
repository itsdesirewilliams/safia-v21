"use server";

import { redirect } from "next/navigation";

import type { SignInState } from "@/lib/auth/action-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Authentication server actions for the admin (Ticket 4).
 *
 * Uses Supabase Auth (the project's single auth system); no custom credential
 * store and no JWT-claim roles. Authorization is resolved separately from
 * `public.profiles.role` in `@/lib/auth/session`.
 */

export async function signInAction(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email address and password." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error: "Sign-in failed. Check your email and password and try again.",
    };
  }

  redirect("/admin/media");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

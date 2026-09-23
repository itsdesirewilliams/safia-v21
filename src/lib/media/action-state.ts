/**
 * Shared result shape for admin media server actions. Lives outside the
 * `"use server"` module because such modules may only export async functions.
 */
export type MediaActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export const INITIAL_MEDIA_ACTION_STATE: MediaActionState = { status: "idle" };

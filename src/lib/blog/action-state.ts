/**
 * Shared result shape for admin Post server actions. Lives outside the
 * `"use server"` module because such modules may only export async functions.
 */
export type PostActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export const INITIAL_POST_ACTION_STATE: PostActionState = { status: "idle" };

/**
 * Sign-in form result shape. Lives outside the `"use server"` module because
 * such modules may only export async functions.
 */
export type SignInState = {
  error: string | null;
};

export const INITIAL_SIGN_IN_STATE: SignInState = { error: null };

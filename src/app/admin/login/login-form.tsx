"use client";

import { useActionState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { fieldClass as FIELD_CLASS } from "@/components/ui/form";
import { INITIAL_SIGN_IN_STATE } from "@/lib/auth/action-state";

import { signInAction } from "../actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    INITIAL_SIGN_IN_STATE,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="admin-email"
          className="text-sm font-medium text-ink-950"
        >
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="text-sm font-medium text-ink-950"
        >
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={FIELD_CLASS}
        />
      </div>

      {state.error && (
        <p className="text-sm font-medium text-brand-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={buttonStyles("primary", "lg", "w-full")}
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

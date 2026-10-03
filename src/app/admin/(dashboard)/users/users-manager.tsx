"use client";

import { useActionState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { fieldClass, fieldLabelClass } from "@/components/ui/form";
import type { AdminUser } from "@/lib/admin/users";
import { ROLES, roleDescription, roleLabel } from "@/lib/auth/roles";

import {
  INITIAL_USER_ACTION_STATE,
  inviteUserAction,
  setUserStatusAction,
  updateUserRoleAction,
} from "./actions";

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }
  return value.slice(0, 10);
}

export function UsersManager({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const [state, formAction, pending] = useActionState(
    inviteUserAction,
    INITIAL_USER_ACTION_STATE,
  );

  return (
    <div className="mt-8 space-y-8">
      {/* Invite */}
      <section className="rounded-card border border-ink-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-ink-950">Invite a user</h2>
        <p className="mt-1 text-sm text-ink-600">
          We email an invitation to set their own password — no passwords are set
          or shown here.
        </p>
        <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[16rem] flex-1">
            <label htmlFor="invite-email" className={fieldLabelClass}>
              Email
            </label>
            <input
              id="invite-email"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className={fieldClass}
            />
          </div>
          <div className="min-w-[11rem]">
            <label htmlFor="invite-role" className={fieldLabelClass}>
              Role
            </label>
            <select id="invite-role" name="role" defaultValue="operator" className={fieldClass}>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={pending} className={buttonStyles("primary", "md")}>
            {pending ? "Inviting…" : "Send invite"}
          </button>
        </form>
        {state.status === "success" && (
          <p role="status" className="mt-3 text-sm font-medium text-success-600">
            {state.message}
          </p>
        )}
        {state.status === "error" && (
          <p role="alert" className="mt-3 text-sm font-medium text-accent-700">
            {state.message}
          </p>
        )}
      </section>

      {/* Users table */}
      <section className="overflow-hidden rounded-card border border-ink-200 bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Users and roles</caption>
          <thead className="bg-ink-50">
            <tr>
              {["User", "Role", "Status", "Joined", "Last sign-in", ""].map(
                (heading) => (
                  <th
                    key={heading || "actions"}
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr key={user.id} className="border-t border-ink-200 align-top">
                  <td className="px-4 py-3">
                    <span className="block font-medium text-ink-950">
                      {user.email ?? "—"}
                      {isSelf && (
                        <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                          You
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-ink-400">
                      {user.role ? roleDescription(user.role) : "No role assigned"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateUserRoleAction} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role ?? ""}
                        className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900"
                        aria-label={`Role for ${user.email ?? user.id}`}
                      >
                        {!user.role && (
                          <option value="" disabled>
                            No role
                          </option>
                        )}
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {roleLabel(role)}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className={buttonStyles("outline", "sm")}>
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.disabled
                          ? "rounded-md bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600"
                          : "rounded-md bg-success-600/10 px-2 py-0.5 text-xs font-semibold text-success-600"
                      }
                    >
                      {user.disabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {formatDate(user.lastSignInAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isSelf && (
                      <form action={setUserStatusAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input
                          type="hidden"
                          name="disabled"
                          value={user.disabled ? "false" : "true"}
                        />
                        <button type="submit" className={buttonStyles("outline", "sm")}>
                          {user.disabled ? "Re-enable" : "Disable"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

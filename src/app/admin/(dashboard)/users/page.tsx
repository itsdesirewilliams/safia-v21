import { AdminPageHeader } from "@/components/admin/page-header";
import { listAdminUsers } from "@/lib/admin/users";
import { requireAdmin } from "@/lib/auth/session";

import { UsersManager } from "./users-manager";

export const metadata = { title: "Users & Access" };
export const dynamic = "force-dynamic";

type UsersSearchParams = { saved?: string; error?: string };

const ERROR_MESSAGES: Record<string, string> = {
  self: "You cannot change or disable your own admin access.",
  invalid: "That request was not valid.",
  save: "Could not save the change. Please try again.",
};

/**
 * Users & Access (Admin only). Invite users, assign one of the three roles, and
 * disable/re-enable access. Enforced by `requireAdmin` here and by the service
 * role boundary in the actions; the UI never trusts the client.
 */
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<UsersSearchParams>;
}) {
  const profile = await requireAdmin();
  const params = await searchParams;

  let users: Awaited<ReturnType<typeof listAdminUsers>> = [];
  let loadError: string | null = null;

  try {
    users = await listAdminUsers();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load users.";
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Users"
        title="Users & access"
        description="Invite teammates, assign roles and control access. Admin, Operator and Copywriter."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Users" },
        ]}
      />

      {params.saved && (
        <p
          role="status"
          className="mt-6 rounded-lg border border-success-600/30 bg-success-600/5 px-4 py-3 text-sm font-medium text-success-600"
        >
          {params.saved === "status" ? "User status updated." : "Role updated."}
        </p>
      )}

      {params.error && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-accent-600/30 bg-accent-600/5 px-4 py-3 text-sm font-medium text-accent-700"
        >
          {ERROR_MESSAGES[params.error] ?? "Something went wrong."}
        </p>
      )}

      {loadError && (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-accent-600/30 bg-accent-600/5 px-4 py-3 text-sm font-medium text-accent-700"
        >
          {loadError}
        </p>
      )}

      <UsersManager users={users} currentUserId={profile.id} />
    </div>
  );
}

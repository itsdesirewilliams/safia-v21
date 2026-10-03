import { AdminShell, type AdminNavSection } from "@/components/admin/admin-shell";
import { buttonStyles } from "@/components/ui/button";
import {
  canManageMedia,
  canManagePosts,
  canManageSettings,
  canManageUsers,
  roleLabel,
} from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";

import { signOutAction } from "../actions";

export const metadata = { title: "Admin" };

/**
 * The guarded admin shell.
 *
 * `requireUser` is the authorization boundary: signed-out users are redirected
 * to login, and users with no role are refused. The sidebar is filtered by role
 * for the operator/copywriter experience, but every module re-checks the role
 * server-side, so hiding a link is never the security control.
 */
export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireUser();
  const role = profile.role;

  const isAdmin = canManageUsers(role);
  const canMedia = canManageMedia(role);
  const canPosts = canManagePosts(role);
  const canSettings = canManageSettings(role);

  const sections: AdminNavSection[] = [
    {
      title: "Overview",
      items: [{ label: "Dashboard", href: "/admin", icon: "dashboard" }],
    },
  ];

  const content = [];
  if (canPosts) {
    content.push({ label: "Posts", href: "/admin/posts", icon: "posts" });
  }
  if (canMedia) {
    content.push({ label: "Media", href: "/admin/media", icon: "media" });
    content.push({ label: "Gallery", href: "/admin/gallery", icon: "gallery" });
  }
  if (content.length > 0) {
    sections.push({ title: "Content", items: content });
  }

  if (canMedia) {
    sections.push({
      title: "Products",
      items: [
        {
          label: "Pattern Images",
          href: "/admin/pattern-images",
          icon: "pattern",
        },
        {
          label: "Product Media",
          href: "/admin/product-images",
          icon: "media",
        },
      ],
    });
    sections.push({
      title: "Quality",
      items: [
        {
          label: "Quality First",
          href: "/admin/quality-first",
          icon: "quality",
        },
      ],
    });
  }

  if (canSettings) {
    sections.push({
      title: "Appearance",
      items: [
        {
          label: "Theme & Settings",
          href: "/admin/appearance",
          icon: "appearance",
        },
      ],
    });
  }

  if (isAdmin) {
    sections.push({
      title: "Users",
      items: [
        { label: "Users & Access", href: "/admin/users", icon: "users" },
      ],
    });
  }

  return (
    <AdminShell
      sections={sections}
      email={profile.email}
      roleLabel={role ? roleLabel(role) : "No role"}
      signOut={
        <form action={signOutAction}>
          <button
            type="submit"
            className={buttonStyles("onDark", "sm", "w-full")}
          >
            Sign out
          </button>
        </form>
      }
    >
      {children}
    </AdminShell>
  );
}

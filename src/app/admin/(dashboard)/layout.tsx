import Image from "next/image";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { roleLabel } from "@/lib/auth/roles";
import { requireMediaManager } from "@/lib/auth/session";

import { signOutAction } from "../actions";
import { AdminNav } from "./admin-nav";

export const metadata = { title: "Media admin" };

/**
 * The guarded admin shell. `requireMediaManager` is the authorization
 * boundary: signed-out users are redirected to login, and signed-in users
 * without an admin/editor role are refused before any admin data renders.
 */
export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireMediaManager();

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Link
              href="/admin/media"
              className="flex items-center gap-3"
              aria-label="Safeway Tyre admin"
            >
              <Image
                src="/brand/safeway-logo-black.png"
                alt="Safeway Tyre"
                width={180}
                height={42}
                className="h-8 w-auto"
              />
              <span className="hidden border-l border-ink-200 pl-3 text-sm font-semibold text-ink-950 sm:inline">
                Admin
              </span>
            </Link>
            <AdminNav />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-ink-900">
                {profile.email ?? "Signed in"}
              </p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-500">
                {profile.role ? roleLabel(profile.role) : "No role"}
              </p>
            </div>
            <form action={signOutAction}>
              <button type="submit" className={buttonStyles("outline", "sm")}>
                Sign out
              </button>
            </form>
          </div>
        </Container>
      </header>

      <main>{children}</main>
    </div>
  );
}

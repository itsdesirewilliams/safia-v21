import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { canManageMedia } from "@/lib/auth/roles";
import { getCurrentProfile } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

import { LoginForm } from "./login-form";

export const metadata = { title: "Admin sign in" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await getCurrentProfile();

  if (profile && canManageMedia(profile.role)) {
    redirect("/admin/media");
  }

  const { error } = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ink-50 px-4 py-16 sm:px-6">
      <div className="w-full max-w-md">
        <Link
          href={ROUTES.home}
          className="flex items-center justify-center"
          aria-label="Safeway Tyre home"
        >
          <Image
            src="/brand/safeway-logo-black.png"
            alt="Safeway Tyre"
            width={180}
            height={42}
            className="h-9 w-auto"
          />
        </Link>

        <div className="mt-8 rounded-card border border-ink-200 bg-white p-8 shadow-card">
          <p className="text-eyebrow text-brand-600">Safeway Tyre Admin</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-950">
            Sign in to manage media
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Use the admin account created for you. Access is limited to admins
            and editors.
          </p>

          {error === "forbidden" && (
            <p
              className="mt-5 rounded-xl border border-accent-500/30 bg-accent-100 px-4 py-3 text-sm text-accent-700"
              role="alert"
            >
              That account does not have media access. Ask an administrator to
              assign a role.
            </p>
          )}

          <div className="mt-6">
            <LoginForm />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          <Link href={ROUTES.home} className="hover:text-ink-800">
            ← Back to safewaytyre.com
          </Link>
        </p>
      </div>
    </div>
  );
}

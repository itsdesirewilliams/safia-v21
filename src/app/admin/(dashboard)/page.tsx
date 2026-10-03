import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/page-header";
import { cn } from "@/lib/cn";
import { loadDashboard } from "@/lib/admin/dashboard";
import { canManageSettings, roleLabel } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { postStatusLabel } from "@/lib/blog/post";
import { formatPostDate } from "@/components/blog/format";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: number | null;
  hint?: string;
  href?: string;
}) {
  const body = (
    <div className="flex h-full flex-col rounded-card border border-ink-200 bg-white p-5 transition-colors hover:border-ink-300">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
        {value ?? "—"}
      </p>
      {hint && <p className="mt-2 text-xs text-ink-500">{hint}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: string }) {
  const paths: Record<string, string> = {
    write: "M16.5 3.75 20.25 7.5M4.5 19.5l4.5-.75L19.5 8.25a1.5 1.5 0 0 0 0-2.12l-1.13-1.13a1.5 1.5 0 0 0-2.12 0L5.25 15.5l-.75 4.5Z",
    upload: "M12 16.5V4.5m0 0L7.5 9M12 4.5 16.5 9M4.5 19.5h15",
    captions:
      "M4.5 5.25h15v13.5h-15zM7.5 9.75h9M7.5 12.75h6",
    users:
      "M15 19.5v-1.5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v1.5M9 11.25a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 8.25v-1.5a3 3 0 0 0-2.25-2.9M16.5 5.34a3 3 0 0 1 0 5.82",
    theme:
      "M12 3.75a8.25 8.25 0 0 0 0 16.5c1.14 0 1.65-.74 1.65-1.5 0-.39-.14-.68-.38-.98-.24-.3-.38-.6-.38-1 0-.84.68-1.52 1.52-1.52h1.09A4.5 4.5 0 0 0 20.25 10.5C20.25 6.77 16.56 3.75 12 3.75Z",
  };
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-card border border-ink-200 bg-white px-4 py-3.5 text-sm font-semibold text-ink-900 transition-colors hover:border-brand-600 hover:text-brand-700"
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-700 transition-colors group-hover:bg-brand-100 group-hover:text-brand-700">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d={paths[icon] ?? paths.write} />
        </svg>
      </span>
      {label}
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const profile = await requireUser();
  const stats = await loadDashboard(profile.role);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Dashboard"
        title={`Welcome back${profile.email ? `, ${profile.email.split("@")[0]}` : ""}`}
        description={
          profile.role
            ? `Signed in as ${roleLabel(profile.role)}.`
            : undefined
        }
      />

      {/* Summary cards */}
      <section className="mt-8">
        <h2 className="sr-only">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.showPosts && (
            <>
              <StatCard
                label="Total posts"
                value={stats.totalPosts}
                href="/admin/posts"
              />
              <StatCard
                label="Published"
                value={stats.publishedPosts}
                href="/admin/posts?status=published"
              />
              <StatCard
                label="Drafts"
                value={stats.draftPosts}
                href="/admin/posts?status=draft"
              />
            </>
          )}
          {stats.showMedia && (
            <>
              <StatCard
                label="Media items"
                value={stats.mediaTotal}
                href="/admin/media"
              />
              <StatCard
                label="Gallery"
                value={stats.galleryCount}
                href="/admin/gallery"
              />
              <StatCard
                label="Product images"
                value={stats.productCount}
                href="/admin/product-images"
              />
              <StatCard
                label="Missing captions"
                value={stats.missingCaptions}
                hint="Images without a caption"
                href={stats.missingCaptions ? "/admin/files/captions?filter=missing" : undefined}
              />
            </>
          )}
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-500">
          Quick actions
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {stats.showPosts && (
            <QuickAction href="/admin/posts/new" label="New blog post" icon="write" />
          )}
          {stats.showMedia && (
            <>
              <QuickAction
                href="/admin/gallery"
                label="Upload gallery images"
                icon="upload"
              />
              <QuickAction
                href="/admin/product-images"
                label="Upload product images"
                icon="upload"
              />
              <QuickAction
                href="/admin/files/captions"
                label="Manage captions"
                icon="captions"
              />
            </>
          )}
          {canManageSettings(profile.role) && (
            <QuickAction
              href="/admin/appearance"
              label="Theme settings"
              icon="theme"
            />
          )}
          {profile.role === "admin" && (
            <QuickAction
              href="/admin/users"
              label="Manage users"
              icon="users"
            />
          )}
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Recent posts */}
        {stats.showPosts && (
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-950">Recent posts</h2>
              <Link
                href="/admin/posts"
                className="text-sm font-semibold text-brand-600 hover:underline"
              >
                View all
              </Link>
            </div>
            {stats.recentPosts.length === 0 ? (
              <p className="mt-4 rounded-card border border-dashed border-ink-300 bg-white p-6 text-sm text-ink-600">
                No posts yet.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-ink-200 overflow-hidden rounded-card border border-ink-200 bg-white">
                {stats.recentPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-ink-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink-950">
                          {post.title}
                        </span>
                        <span className="text-xs text-ink-500">
                          {post.author} · {formatPostDate(post.updatedAt)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold",
                          post.status === "published"
                            ? "bg-success-600/10 text-success-600"
                            : "bg-ink-100 text-ink-600",
                        )}
                      >
                        {postStatusLabel(post.status)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Recent uploads */}
        {stats.showMedia && (
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-950">Recent uploads</h2>
              <Link
                href="/admin/media"
                className="text-sm font-semibold text-brand-600 hover:underline"
              >
                View media
              </Link>
            </div>
            {stats.recentMedia.length === 0 ? (
              <p className="mt-4 rounded-card border border-dashed border-ink-300 bg-white p-6 text-sm text-ink-600">
                No media uploaded yet.
              </p>
            ) : (
              <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-3">
                {stats.recentMedia.map((item) => (
                  <li
                    key={item.id}
                    className="overflow-hidden rounded-lg border border-ink-200 bg-white"
                  >
                    <div className="flex h-24 items-center justify-center bg-ink-50">
                      {item.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.alt ?? ""}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
                          {item.type}
                        </span>
                      )}
                    </div>
                    <p className="truncate px-2 py-1.5 text-[11px] text-ink-500">
                      {item.caption ?? item.path.split("/").pop()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {!stats.showPosts && !stats.showMedia && (
        <p className="mt-10 rounded-card border border-dashed border-ink-300 bg-white p-6 text-sm text-ink-600">
          Your account has no modules yet. Ask an administrator to assign a role.
        </p>
      )}
    </div>
  );
}

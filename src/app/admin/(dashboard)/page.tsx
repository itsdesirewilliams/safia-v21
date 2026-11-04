import Link from "next/link";

import { AdminIcon, type AdminIconName } from "@/components/admin/admin-icon";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { loadDashboard } from "@/lib/admin/dashboard";
import { canManageSettings, roleLabel } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { postStatusLabel } from "@/lib/blog/post";
import { formatPostDate } from "@/components/blog/format";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

type Tone = "brand" | "accent" | "neutral" | "success";

function StatCard({
  label,
  value,
  hint,
  href,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: number | null;
  hint?: string;
  href?: string;
  icon: AdminIconName;
  tone?: Tone;
}) {
  const body = (
    <div className="admin-panel group flex h-full flex-col p-4 transition-colors hover:border-ink-300 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
          {label}
        </p>
        <span
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            tone === "brand" && "bg-brand-100 text-brand-700",
            tone === "accent" && "bg-accent-100 text-accent-700",
            tone === "success" && "bg-success-600/10 text-success-600",
            tone === "neutral" && "bg-ink-100 text-ink-600",
          )}
        >
          <AdminIcon name={icon} className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
        {value ?? "—"}
      </p>
      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
        <p className="text-xs text-ink-500">{hint ?? "Live count"}</p>
        {href && (
          <AdminIcon
            name="chevronRight"
            className="h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
          />
        )}
      </div>
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

function QuickAction({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: AdminIconName;
}) {
  return (
    <Link
      href={href}
      className="admin-panel group flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-ink-900 transition-colors hover:border-brand-600 hover:text-brand-700"
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-600 transition-colors group-hover:bg-brand-100 group-hover:text-brand-700">
        <AdminIcon name={icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <AdminIcon
        name="chevronRight"
        className="h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
      />
    </Link>
  );
}

function SectionHeading({
  title,
  href,
  hrefLabel,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-ink-950">{title}</h2>
      {href && (
        <Link
          href={href}
          className="text-xs font-semibold text-brand-600 hover:underline"
        >
          {hrefLabel ?? "View all"}
        </Link>
      )}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const profile = await requireUser();
  const stats = await loadDashboard(profile.role);
  const contentTotal =
    (stats.publishedPosts ?? 0) + (stats.draftPosts ?? 0);
  const publishedPercent =
    contentTotal > 0
      ? Math.round(((stats.publishedPosts ?? 0) / contentTotal) * 100)
      : 0;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title={`Welcome back${profile.email ? `, ${profile.email.split("@")[0]}` : ""}`}
        description={
          profile.role
            ? `Signed in as ${roleLabel(profile.role)}. Here is the current state of the Safeway Tyre workspace.`
            : "Here is the current state of the Safeway Tyre workspace."
        }
        actions={
          <>
            {stats.showPosts && (
              <Link href="/admin/posts/new" className={buttonStyles("primary", "sm")}>
                New post
              </Link>
            )}
            {stats.showMedia && (
              <Link href="/admin/media" className={buttonStyles("outline", "sm")}>
                Media library
              </Link>
            )}
          </>
        }
      />

      <section className="mt-6" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">
          Workspace overview
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.showPosts && (
            <>
              <StatCard
                label="Total posts"
                value={stats.totalPosts}
                href="/admin/posts"
                icon="posts"
                tone="brand"
              />
              <StatCard
                label="Published"
                value={stats.publishedPosts}
                href="/admin/posts?status=published"
                icon="check"
                tone="success"
              />
              <StatCard
                label="Drafts"
                value={stats.draftPosts}
                href="/admin/posts?status=draft"
                icon="posts"
                tone="neutral"
              />
            </>
          )}
          {stats.showMedia && (
            <>
              <StatCard
                label="Media items"
                value={stats.mediaTotal}
                href="/admin/media"
                icon="media"
                tone="brand"
              />
              <StatCard
                label="Gallery"
                value={stats.galleryCount}
                href="/admin/gallery"
                icon="gallery"
                tone="neutral"
              />
              <StatCard
                label="Product images"
                value={stats.productCount}
                href="/admin/product-images"
                icon="pattern"
                tone="neutral"
              />
              <StatCard
                label="Missing captions"
                value={stats.missingCaptions}
                hint="Images without a caption"
                href={
                  stats.missingCaptions
                    ? "/admin/files/captions?filter=missing"
                    : undefined
                }
                icon="appearance"
                tone={stats.missingCaptions ? "accent" : "success"}
              />
            </>
          )}
        </div>
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <section className="admin-panel p-5 sm:p-6" aria-labelledby="quick-actions-heading">
          <SectionHeading title="Quick actions" />
          <h2 id="quick-actions-heading" className="sr-only">
            Quick actions
          </h2>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {stats.showPosts && (
              <QuickAction href="/admin/posts/new" label="New blog post" icon="posts" />
            )}
            {stats.showMedia && (
              <>
                <QuickAction
                  href="/admin/gallery"
                  label="Upload gallery images"
                  icon="gallery"
                />
                <QuickAction
                  href="/admin/product-images"
                  label="Upload product images"
                  icon="media"
                />
                <QuickAction
                  href="/admin/files/captions"
                  label="Manage captions"
                  icon="appearance"
                />
              </>
            )}
            {canManageSettings(profile.role) && (
              <QuickAction href="/admin/appearance" label="Theme settings" icon="appearance" />
            )}
            {profile.role === "admin" && (
              <QuickAction href="/admin/users" label="Manage users" icon="users" />
            )}
          </div>
        </section>

        {stats.showPosts && (
          <section className="admin-panel p-5 sm:p-6" aria-labelledby="content-status-heading">
            <SectionHeading title="Content status" href="/admin/posts" />
            <h2 id="content-status-heading" className="sr-only">
              Content status
            </h2>
            {contentTotal === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-ink-300 px-4 py-6 text-sm text-ink-500">
                No posts yet.
              </p>
            ) : (
              <>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-3xl font-bold tracking-tight text-ink-950">
                      {publishedPercent}%
                    </p>
                    <p className="mt-1 text-xs text-ink-500">published</p>
                  </div>
                  <p className="text-right text-xs text-ink-500">
                    <span className="font-semibold text-ink-900">
                      {stats.publishedPosts ?? 0}
                    </span>{" "}
                    published
                    <br />
                    <span className="font-semibold text-ink-900">
                      {stats.draftPosts ?? 0}
                    </span>{" "}
                    drafts
                  </p>
                </div>
                <div
                  className="mt-4 h-2 overflow-hidden rounded-full bg-ink-100"
                  role="img"
                  aria-label={`${publishedPercent}% of posts are published`}
                >
                  <span
                    className="block h-full rounded-full bg-brand-600 transition-[width] duration-500"
                    style={{ width: `${publishedPercent}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-ink-500">
                  Based on {contentTotal} {contentTotal === 1 ? "post" : "posts"}.
                </p>
              </>
            )}
          </section>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {stats.showPosts && (
          <section className="admin-panel overflow-hidden" aria-labelledby="recent-posts-heading">
            <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
              <h2 id="recent-posts-heading" className="text-sm font-semibold text-ink-950">
                Recent posts
              </h2>
              <Link
                href="/admin/posts"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                View all
              </Link>
            </div>
            {stats.recentPosts.length === 0 ? (
              <p className="p-5 text-sm text-ink-500">
                No posts yet. Create the first one.
              </p>
            ) : (
              <ul className="divide-y divide-ink-200">
                {stats.recentPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-ink-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink-950">
                          {post.title || "Untitled draft"}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-500">
                          {post.author || "Safeway Tyre"} · {formatPostDate(post.updatedAt)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
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

        {stats.showMedia && (
          <section className="admin-panel overflow-hidden" aria-labelledby="recent-media-heading">
            <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
              <h2 id="recent-media-heading" className="text-sm font-semibold text-ink-950">
                Recent uploads
              </h2>
              <Link
                href="/admin/media"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                View media
              </Link>
            </div>
            {stats.recentMedia.length === 0 ? (
              <p className="p-5 text-sm text-ink-500">No media uploaded yet.</p>
            ) : (
              <ul className="grid grid-cols-3 gap-3 p-5">
                {stats.recentMedia.map((item) => (
                  <li
                    key={item.id}
                    className="overflow-hidden rounded-lg border border-ink-200 bg-ink-50"
                  >
                    <div className="flex h-24 items-center justify-center">
                      {item.type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.url}
                          alt={item.alt ?? ""}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                          {item.type}
                        </span>
                      )}
                    </div>
                    <p className="truncate border-t border-ink-200 px-2 py-1.5 text-[11px] text-ink-500">
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
        <p className="admin-panel mt-6 p-6 text-sm text-ink-500">
          Your account has no modules yet. Ask an administrator to assign a role.
        </p>
      )}
    </div>
  );
}

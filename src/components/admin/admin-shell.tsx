"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";

export type AdminNavItem = {
  label: string;
  href: string;
  /** Key into the built-in icon set. */
  icon: string;
  /** Only admins see this item. */
  adminOnly?: boolean;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export type AdminShellProps = {
  sections: AdminNavSection[];
  email: string | null;
  roleLabel: string;
  signOut: React.ReactNode;
  children: React.ReactNode;
};

const ICON_PATHS: Record<string, string> = {
  dashboard:
    "M3.75 3.75h6v6h-6zM14.25 3.75h6v6h-6zM3.75 14.25h6v6h-6zM14.25 14.25h6v6h-6z",
  posts:
    "M6 4.5h12a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.5 18V6A1.5 1.5 0 0 1 6 4.5ZM8.25 9h7.5M8.25 12h7.5M8.25 15h4.5",
  media:
    "M3.75 6.75h16.5v10.5H3.75zM3.75 15l4.5-4.5 3.75 3.75 2.25-2.25 4.5 4.5M14.25 9.75h.008v.008h-.008z",
  gallery:
    "M4.5 5.25h15v10.5h-15zM8.25 20.25l3.75-3 3 2.25 3.75-4.5M9.75 9h.008v.008H9.75z",
  pattern:
    "M12 3.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5ZM12 7.5v4.5l3 1.5M8.25 12h.008M15.75 12h.008",
  quality:
    "M9 12.75 11 14.5l4-4.5M12 3l6.75 3v5.25c0 4.28-2.9 8.13-6.75 9.75-3.85-1.62-6.75-5.47-6.75-9.75V6L12 3Z",
  appearance:
    "M12 3.75a8.25 8.25 0 0 0 0 16.5c1.14 0 1.65-.74 1.65-1.5 0-.39-.14-.68-.38-.98-.24-.3-.38-.6-.38-1 0-.84.68-1.52 1.52-1.52h1.09A4.5 4.5 0 0 0 20.25 10.5C20.25 6.77 16.56 3.75 12 3.75ZM7.5 12a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25Zm3-3.75a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25Zm4.5 0a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25Z",
  users:
    "M15 19.5v-1.5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v1.5M9 11.25a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 8.25v-1.5a3 3 0 0 0-2.25-2.9M16.5 5.34a3 3 0 0 1 0 5.82",
};

function NavIcon({ name, className }: { name: string; className?: string }) {
  const path = ICON_PATHS[name] ?? ICON_PATHS.dashboard;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={path} />
    </svg>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The admin application shell: a persistent sidebar on desktop and a slide-over
 * drawer on mobile. Pure CSS transitions only — content is never hidden behind
 * an animation, so the workspace paints immediately (PART 12).
 */
export function AdminShell({
  sections,
  email,
  roleLabel,
  signOut,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/65 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <NavIcon
                      name={item.icon}
                      className={cn(
                        "h-5 w-5 shrink-0",
                        active ? "text-accent-500" : "text-white/45",
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5 px-5 py-5">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-sm font-bold text-white">
        S
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-bold tracking-tight text-white">
          Safeway Tyre
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
          Admin
        </span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink-950 lg:flex">
        {brand}
        {nav}
        <div className="border-t border-white/10 px-5 py-4">
          <p className="truncate text-xs font-medium text-white/80">{email}</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
            {roleLabel}
          </p>
          <div className="mt-3">{signOut}</div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin navigation"
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 text-ink-800"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <Link href="/admin" className="text-sm font-bold tracking-tight text-ink-950">
          Safeway Tyre Admin
        </Link>
        <span className="w-10" aria-hidden="true" />
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-950/50"
          />
          <div className="absolute inset-y-0 left-0 flex w-[84%] max-w-xs flex-col bg-ink-950">
            {brand}
            {nav}
            <div className="border-t border-white/10 px-5 py-4">
              <p className="truncate text-xs font-medium text-white/80">{email}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                {roleLabel}
              </p>
              <div className="mt-3">{signOut}</div>
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-[110rem] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

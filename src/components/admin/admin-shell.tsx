"use client";

/* eslint-disable react-hooks/set-state-in-effect -- one-time localStorage/browser initialization */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AdminIcon, type AdminIconName } from "@/components/admin/admin-icon";
import { AdminThemeSwitcher } from "@/components/admin/admin-theme";
import { cn } from "@/lib/cn";

export type AdminNavItem = {
  label: string;
  href?: string;
  /** Key into the admin icon set. */
  icon: AdminIconName;
  /** Only admins see this item. */
  adminOnly?: boolean;
  /** Optional nested navigation, used for grouped modules. */
  children?: AdminNavItem[];
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

const SIDEBAR_STORAGE_KEY = "safeway-admin-sidebar-collapsed";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function itemIsActive(pathname: string, item: AdminNavItem): boolean {
  return Boolean(
    (item.href && isActive(pathname, item.href)) ||
      item.children?.some((child) => itemIsActive(pathname, child)),
  );
}

function findActiveItem(
  sections: AdminNavSection[],
  pathname: string,
): AdminNavItem | null {
  for (const section of sections) {
    for (const item of section.items) {
      if (itemIsActive(pathname, item)) return item;
    }
  }
  return null;
}

function initials(email: string | null): string {
  if (!email) return "ST";
  const local = email.split("@")[0] ?? "";
  return local.slice(0, 2).toUpperCase() || "ST";
}

function SidebarNav({
  sections,
  collapsed,
  onNavigate,
  onExpand,
}: {
  sections: AdminNavSection[];
  collapsed: boolean;
  onNavigate: () => void;
  onExpand: () => void;
}) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});


  const renderItem = (item: AdminNavItem) => {
    const active = itemIsActive(pathname, item);
    const hasChildren = Boolean(item.children?.length);
    const expanded = openGroups[item.label] ?? true;

    if (hasChildren && !item.href) {
      return (
        <li key={item.label}>
          <button
            type="button"
            title={collapsed ? item.label : undefined}
            aria-label={collapsed ? item.label : undefined}
            aria-expanded={expanded}
            data-active={active ? "true" : "false"}
            onClick={() => {
              if (collapsed) {
                onExpand();
                return;
              }
              setOpenGroups((current) => ({
                ...current,
                [item.label]: !expanded,
              }));
            }}
            className="admin-sidebar-link group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <AdminIcon name={item.icon} className="admin-nav-icon h-[18px] w-[18px] shrink-0" />
            <span className="admin-sidebar-label flex-1 truncate text-left">
              {item.label}
            </span>
            {!collapsed && (
              <AdminIcon
                name="chevronDown"
                className={cn(
                  "admin-sidebar-chevron h-3.5 w-3.5 transition-transform",
                  expanded && "rotate-180",
                )}
              />
            )}
          </button>

          {!collapsed && expanded && (
            <ul className="mt-1 space-y-0.5 border-l border-white/10 pl-4">
              {item.children?.map(renderItem)}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.href ?? item.label}>
        <Link
          href={item.href ?? "/admin"}
          title={collapsed ? item.label : undefined}
          aria-label={collapsed ? item.label : undefined}
          aria-current={active ? "page" : undefined}
          data-active={active ? "true" : "false"}
          onClick={onNavigate}
          className="admin-sidebar-link group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          <AdminIcon name={item.icon} className="admin-nav-icon h-[18px] w-[18px] shrink-0" />
          <span className="admin-sidebar-label truncate">{item.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
      {sections.map((section) => (
        <div key={section.title} className="mb-5 last:mb-0">
          <p className="admin-sidebar-section-label px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em]">
            {section.title}
          </p>
          <ul className="space-y-0.5">{section.items.map(renderItem)}</ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * Admin application shell: a collapsible, theme-aware SaaS sidebar and header.
 * Navigation remains role-filtered by the server layout; this component only
 * presents the destinations it receives.
 */
export function AdminShell({
  sections,
  email,
  roleLabel,
  signOut,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1");
    } catch {
      // ignore unavailable storage
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const activeItem = useMemo(
    () => findActiveItem(sections, pathname),
    [sections, pathname],
  );
  const activeLabel = activeItem?.label ?? "Dashboard";

  const setSidebarCollapsed = (next: boolean) => {
    setCollapsed(next);
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
  };

  const brand = (
    <Link
      href="/admin"
      onClick={() => setMobileOpen(false)}
      className="admin-sidebar-brand flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4"
    >
      <span className="admin-sidebar-mark inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] text-sm font-bold text-white">
        S
      </span>
      <span className="admin-sidebar-label flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold tracking-tight text-white">
          Safeway Tyre
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
          Admin workspace
        </span>
      </span>
    </Link>
  );

  return (
    <div
      className={cn(
        "admin-app min-h-screen",
        collapsed && "admin-sidebar-collapsed",
      )}
    >
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "admin-sidebar fixed inset-y-0 left-0 z-30 hidden flex-col transition-[width] duration-200 lg:flex",
          collapsed ? "w-[var(--admin-sidebar-collapsed-width)]" : "w-[var(--admin-sidebar-width)]",
        )}
      >
        {brand}
        <SidebarNav
          sections={sections}
          collapsed={collapsed}
          onNavigate={() => {}}
          onExpand={() => setSidebarCollapsed(false)}
        />
        <div className="admin-sidebar-footer border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white">
              {initials(email)}
            </span>
            <span className="admin-sidebar-label min-w-0">
              <span className="block truncate text-xs font-medium text-white/85">
                {email ?? "Signed in"}
              </span>
              <span className="block truncate text-[10px] uppercase tracking-[0.14em] text-white/40">
                {roleLabel}
              </span>
            </span>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "min-h-screen transition-[padding] duration-200",
          collapsed
            ? "lg:pl-[var(--admin-sidebar-collapsed-width)]"
            : "lg:pl-[var(--admin-sidebar-width)]",
        )}
      >
        <header className="admin-header sticky top-0 z-20 flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open admin navigation"
              aria-expanded={mobileOpen}
              className="admin-header-button admin-header-mobile lg:hidden"
            >
              <AdminIcon name="menu" />
            </button>
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="admin-header-button admin-header-panel hidden lg:inline-flex"
            >
              <AdminIcon name="panelLeft" />
            </button>

            <nav
              aria-label="Breadcrumb"
              className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex"
            >
              <Link
                href="/admin"
                className="shrink-0 text-ink-500 transition-colors hover:text-ink-900"
              >
                Admin
              </Link>
              <AdminIcon name="chevronRight" className="h-3.5 w-3.5 shrink-0 text-ink-300" />
              <span className="truncate font-medium text-ink-900">{activeLabel}</span>
            </nav>
            <span className="truncate text-sm font-semibold text-ink-900 sm:hidden">
              {activeLabel}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <AdminThemeSwitcher />
            <details className="admin-profile relative">
              <summary className="flex cursor-pointer items-center gap-2 rounded-[0.65rem] border border-transparent p-1 pr-2 transition-colors hover:bg-ink-50">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-[11px] font-semibold text-ink-700">
                  {initials(email)}
                </span>
                <span className="hidden min-w-0 text-left md:block">
                  <span className="block max-w-[12rem] truncate text-xs font-medium text-ink-900">
                    {email ?? "Signed in"}
                  </span>
                  <span className="block text-[10px] uppercase tracking-[0.12em] text-ink-500">
                    {roleLabel}
                  </span>
                </span>
                <AdminIcon name="chevronDown" className="hidden h-3.5 w-3.5 text-ink-400 md:block" />
              </summary>
              <div className="admin-menu absolute right-0 top-full z-50 mt-2 w-64 p-2">
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-semibold text-ink-950">{email}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                    {roleLabel}
                  </p>
                </div>
                <div className="border-t border-ink-200 p-1.5">{signOut}</div>
              </div>
            </details>
          </div>
        </header>

        <main className="admin-main">{children}</main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
          />
          <aside className="admin-sidebar absolute inset-y-0 left-0 flex w-[min(86%,20rem)] flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pr-2">
              {brand}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close admin navigation"
                className="admin-sidebar-link inline-flex h-9 w-9 items-center justify-center rounded-lg"
              >
                <AdminIcon name="close" className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav
              sections={sections}
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
              onExpand={() => {}}
            />
          </aside>
        </div>
      )}
    </div>
  );
}

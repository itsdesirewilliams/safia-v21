"use client";

/* eslint-disable react-hooks/set-state-in-effect -- one-time localStorage/system preference hydration */

import { useEffect, useId, useRef, useState } from "react";

import { AdminIcon } from "@/components/admin/admin-icon";
import { ADMIN_THEME_STORAGE_KEY } from "@/components/admin/admin-theme-script";
import { cn } from "@/lib/cn";

export type AdminTheme = "light" | "dark" | "system";


function readStoredTheme(): AdminTheme {
  if (typeof window === "undefined") return "system";
  try {
    const value = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
    return value === "light" || value === "dark" || value === "system"
      ? value
      : "system";
  } catch {
    return "system";
  }
}

function prefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function applyAdminTheme(theme: AdminTheme) {
  if (typeof document === "undefined") return;
  const dark = theme === "dark" || (theme === "system" && prefersDark());
  document.documentElement.dataset.adminTheme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

const OPTIONS: { value: AdminTheme; label: string; icon: "sun" | "moon" | "monitor" }[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "monitor" },
];

/** Admin-only light/dark/system switcher. Public site themes are untouched. */
export function AdminThemeSwitcher() {
  const [theme, setTheme] = useState<AdminTheme>("system");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = readStoredTheme();
    setTheme(stored);
    applyAdminTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.adminTheme;
      document.documentElement.style.colorScheme = "";
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyAdminTheme(theme);
    try {
      window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable in private/locked-down browsers.
    }

    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyAdminTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mounted, theme]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[2];

  return (
    <div ref={rootRef} className="admin-theme-switcher relative">
      <button
        type="button"
        aria-label={`Theme: ${mounted ? current.label : "System"}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="admin-icon-button"
      >
        <AdminIcon name={current.icon} className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Admin color theme"
          className="admin-menu absolute right-0 top-full z-50 mt-2 w-44 p-1.5"
        >
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === option.value}
              onClick={() => {
                setTheme(option.value);
                setOpen(false);
              }}
              className={cn(
                "admin-menu-item flex w-full items-center gap-2.5",
                theme === option.value && "admin-menu-item-active",
              )}
            >
              <AdminIcon name={option.icon} className="h-4 w-4" />
              <span className="flex-1 text-left">{option.label}</span>
              {theme === option.value && (
                <AdminIcon name="check" className="h-3.5 w-3.5" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

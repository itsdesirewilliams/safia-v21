"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin/media", label: "Media" },
  { href: "/admin/posts", label: "Posts" },
] as const;

/** Admin top-level navigation with a path-aware current item. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="hidden items-center gap-1 sm:flex">
      {LINKS.map((link) => {
        const current =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              current
                ? "bg-ink-100 text-ink-950"
                : "text-ink-600 hover:bg-ink-50 hover:text-ink-950",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { PRIMARY_NAV, ROUTES, type NavItem } from "@/lib/routes";
import { SITE } from "@/lib/site";

function isActive(pathname: string, href: string): boolean {
  if (href === ROUTES.home) {
    return pathname === ROUTES.home;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isDropdownActive(pathname: string, item: NavItem): boolean {
  return (
    "children" in item &&
    item.children.some((child) => isActive(pathname, child.href))
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const closeMenus = () => {
    setMobileOpen(false);
    setProductsOpen(false);
    setMobileProductsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={ROUTES.home}
          className="flex items-center"
          aria-label={SITE.name}
        >
          <Image
            src="/brand/safeway-logo-black.png"
            alt={SITE.name}
            width={180}
            height={42}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((item) => {
              if (!("children" in item)) {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={closeMenus}
                      aria-current={active ? "page" : undefined}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-ink-100 ${
                        active ? "text-brand-600" : "text-ink-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              const active = isDropdownActive(pathname, item);
              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => setProductsOpen(false)}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={productsOpen}
                    onClick={() => setProductsOpen((open) => !open)}
                    className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-ink-100 ${
                      active ? "text-brand-600" : "text-ink-800"
                    }`}
                  >
                    {item.label}
                    <Chevron open={productsOpen} />
                  </button>
                  <ul
                    className={`absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-ink-100 bg-white p-2 shadow-lg ${
                      productsOpen ? "" : "hidden"
                    }`}
                  >
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={closeMenus}
                          className="block rounded-md px-3 py-2 text-sm text-ink-800 transition-colors hover:bg-ink-100 hover:text-brand-600"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-ink-800 hover:bg-ink-100 lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-ink-100 bg-white lg:hidden"
        >
          <ul className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {PRIMARY_NAV.map((item) => {
              if (!("children" in item)) {
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={closeMenus}
                      className="block rounded-md px-3 py-2 text-base font-medium text-ink-800 hover:bg-ink-100"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-expanded={mobileProductsOpen}
                    onClick={() => setMobileProductsOpen((open) => !open)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-base font-medium text-ink-800 hover:bg-ink-100"
                  >
                    {item.label}
                    <Chevron open={mobileProductsOpen} />
                  </button>
                  {mobileProductsOpen && (
                    <ul className="mt-1 space-y-1 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={closeMenus}
                            className="block rounded-md px-3 py-2 text-sm text-ink-800 hover:bg-ink-100"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

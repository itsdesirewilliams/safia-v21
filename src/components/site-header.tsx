"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={cn(
        "h-3.5 w-3.5 transition-transform duration-200",
        open && "rotate-180",
      )}
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMenus = () => {
    setMobileOpen(false);
    setProductsOpen(false);
    setMobileProductsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/80 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
        <Link
          href={ROUTES.home}
          className="flex shrink-0 items-center"
          aria-label={SITE.name}
        >
          <Image
            src="/brand/safeway-logo-black.png"
            alt={SITE.name}
            width={180}
            height={42}
            priority
            className="h-8 w-auto lg:h-9"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center lg:flex">
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
                      className={cn(
                        "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                        active
                          ? "text-brand-600"
                          : "text-ink-600 hover:bg-ink-50 hover:text-ink-950",
                      )}
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
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-brand-600"
                        : "text-ink-600 hover:bg-ink-50 hover:text-ink-950",
                    )}
                  >
                    {item.label}
                    <Chevron open={productsOpen} />
                  </button>
                  <div
                    className={cn(
                      "absolute left-1/2 top-full z-50 mt-3 w-[22rem] -translate-x-1/2 rounded-2xl border border-ink-200 bg-white p-2 shadow-pop transition duration-150",
                      productsOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-1 opacity-0",
                    )}
                  >
                    <p className="px-3 pb-2 pt-2 text-eyebrow text-ink-400">
                      Product ranges
                    </p>
                    <ul className="grid grid-cols-2 gap-0.5">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={closeMenus}
                            className="block rounded-xl px-3 py-2 text-sm text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-950"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/#search"
            aria-label="Search the catalogue"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-950 lg:inline-flex"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
          <ButtonLink
            href={ROUTES.contactUs}
            size="sm"
            className="hidden lg:inline-flex"
          >
            Request a Quotation
          </ButtonLink>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-800 transition-colors hover:bg-ink-50 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 animate-fade-in bg-ink-950/50 backdrop-blur-sm"
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm animate-slide-in-right flex-col bg-white shadow-pop">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink-100 px-5">
              <Image
                src="/brand/safeway-logo-black.png"
                alt={SITE.name}
                width={180}
                height={42}
                className="h-8 w-auto"
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-800 transition-colors hover:bg-ink-50"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav
              aria-label="Mobile"
              className="flex-1 overflow-y-auto px-3 py-4"
            >
              <ul className="space-y-0.5">
                {PRIMARY_NAV.map((item) => {
                  if (!("children" in item)) {
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={closeMenus}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "block rounded-xl px-3.5 py-3 text-base font-medium transition-colors",
                            active
                              ? "bg-brand-100/60 text-brand-700"
                              : "text-ink-800 hover:bg-ink-50",
                          )}
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
                        className="flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-base font-medium text-ink-800 transition-colors hover:bg-ink-50"
                      >
                        {item.label}
                        <Chevron open={mobileProductsOpen} />
                      </button>
                      {mobileProductsOpen && (
                        <ul className="mb-1 ml-3 space-y-0.5 border-l border-ink-200 pl-3">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={closeMenus}
                                className="block rounded-lg px-3 py-2.5 text-sm text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-950"
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

            <div className="shrink-0 space-y-3 border-t border-ink-100 p-5">
              <ButtonLink
                href={ROUTES.contactUs}
                size="lg"
                className="w-full max-lg:rounded-xl"
                onClick={closeMenus}
              >
                Request a Quotation
              </ButtonLink>
              <a
                href={`mailto:${SITE.emails.director}`}
                className="block text-center text-sm font-medium text-ink-600 hover:text-ink-950"
              >
                {SITE.emails.director}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

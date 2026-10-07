"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { LanguageSelector } from "@/components/i18n/language-selector";
import { ButtonLink } from "@/components/ui/button";
import { PRODUCT_MENU_ORDER } from "@/lib/catalogue/categories";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/url";
import { ROUTES } from "@/lib/routes";
import { SITE } from "@/lib/site";

/** A nav leaf. No `href` means it is shown but not yet linked. */
type LocalizedNavLeaf = { label: string; href?: string };

type LocalizedNavChild = LocalizedNavLeaf & {
  /** Optional second-level items (Truck & Bus → Nylon / PCR / TBR). */
  children?: LocalizedNavLeaf[];
};

type LocalizedNavItem =
  | { key: string; label: string; href: string }
  | { key: string; label: string; children: LocalizedNavChild[] };

/**
 * How long the desktop Products dropdown stays open after the pointer leaves
 * it. The delay gives a visitor time to travel from "Products" into the menu
 * (and back) without it snapping shut.
 */
const PRODUCTS_CLOSE_DELAY_MS = 2500;

/**
 * How long the floating Truck & Bus submenu lingers after the pointer leaves
 * the parent row. The pointer has to cross the right-hand column to reach the
 * submenu, so this tolerance is what prevents hover flicker.
 */
const SUBMENU_CLOSE_DELAY_MS = 300;

function isActive(pathname: string, href: string): boolean {
  if (href === ROUTES.home) {
    return pathname === ROUTES.home;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isDropdownActive(
  pathname: string,
  item: LocalizedNavItem,
): boolean {
  if (!("children" in item)) {
    return false;
  }
  return item.children.some(
    (child) =>
      (child.href ? isActive(pathname, child.href) : false) ||
      (child.children?.some((sub) =>
        sub.href ? isActive(pathname, sub.href) : false,
      ) ??
        false),
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

/** A right-pointing chevron marking an item that opens a submenu. */
function ChevronRight() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 shrink-0 text-ink-400"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.17 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
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

export function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileTruckBusOpen, setMobileTruckBusOpen] = useState(false);

  const nav: LocalizedNavItem[] = [
    { key: "home", label: dict.nav.home, href: localizedHref(locale, ROUTES.home) },
    {
      key: "about",
      label: dict.nav.aboutUs,
      href: localizedHref(locale, ROUTES.aboutUs),
    },
    {
      key: "catalogue",
      label: dict.nav.catalogue,
      href: localizedHref(locale, ROUTES.catalogue),
    },
    {
      key: "products",
      label: dict.nav.products,
      // Two-column order: read across the grid the left column is Truck & Bus,
      // Agriculture, Forklift, Tubes and the right is Three Wheeler, OTR,
      // Motorcycle. Truck & Bus is one item whose ranges open in a floating
      // submenu on hover (desktop) or expand in place (mobile).
      children: PRODUCT_MENU_ORDER.map((slug): LocalizedNavChild => {
        if (slug === "truck-bus") {
          return {
            label: dict.categories[slug],
            href: localizedHref(locale, ROUTES.category(slug)),
            children: [
              {
                label: dict.nav.nylon,
                href: localizedHref(locale, ROUTES.category("truck-bus")),
              },
              {
                label: dict.nav.pcr,
                href: localizedHref(locale, ROUTES.pcrSafeway),
              },
              {
                label: dict.nav.tbr,
                href: localizedHref(locale, ROUTES.tbrSafeway),
              },
            ],
          };
        }
        return {
          label: dict.categories[slug],
          href: localizedHref(locale, ROUTES.category(slug)),
        };
      }),
    },
    {
      key: "contact",
      label: dict.nav.contactUs,
      href: localizedHref(locale, ROUTES.contactUs),
    },
    {
      key: "quality",
      label: dict.nav.qualityFirst,
      href: localizedHref(locale, ROUTES.qualityFirst),
    },
    {
      key: "gallery",
      label: dict.nav.gallery,
      href: localizedHref(locale, ROUTES.gallery),
    },
    // Blogs is intentionally not in the header navigation; it stays prominent
    // in the footer (see SiteFooter).
  ];

  const productsRef = useRef<HTMLLIElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearProductsClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const clearSubmenuClose = useCallback(() => {
    if (submenuCloseTimerRef.current !== null) {
      clearTimeout(submenuCloseTimerRef.current);
      submenuCloseTimerRef.current = null;
    }
  }, []);

  const openProducts = useCallback(() => {
    clearProductsClose();
    setProductsOpen(true);
  }, [clearProductsClose]);

  /**
   * Keep the desktop dropdown open while the pointer moves from Products into
   * the menu: the close is deferred rather than immediate, so travelling across
   * the gap (or back to the trigger) never dismisses it.
   */
  const scheduleProductsClose = useCallback(() => {
    clearProductsClose();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setProductsOpen(false);
      setSubmenuOpen(false);
    }, PRODUCTS_CLOSE_DELAY_MS);
  }, [clearProductsClose]);

  const openSubmenu = useCallback(() => {
    clearSubmenuClose();
    setSubmenuOpen(true);
  }, [clearSubmenuClose]);

  /**
   * The submenu is a DOM descendant of the Products item, so moving into it
   * never triggers the parent's mouseleave. This deferred close only fires when
   * the pointer lands on a *different* product row (or leaves the submenu).
   */
  const scheduleSubmenuClose = useCallback(() => {
    clearSubmenuClose();
    submenuCloseTimerRef.current = setTimeout(() => {
      submenuCloseTimerRef.current = null;
      setSubmenuOpen(false);
    }, SUBMENU_CLOSE_DELAY_MS);
  }, [clearSubmenuClose]);

  useEffect(() => {
    return () => {
      clearProductsClose();
      clearSubmenuClose();
    };
  }, [clearProductsClose, clearSubmenuClose]);

  // Clicking elsewhere (or pressing Escape) closes the desktop dropdown.
  useEffect(() => {
    if (!productsOpen) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (
        productsRef.current &&
        !productsRef.current.contains(event.target as Node)
      ) {
        clearProductsClose();
        clearSubmenuClose();
        setProductsOpen(false);
        setSubmenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearProductsClose();
        clearSubmenuClose();
        setProductsOpen(false);
        setSubmenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [productsOpen, clearProductsClose, clearSubmenuClose]);

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
    clearProductsClose();
    clearSubmenuClose();
    setMobileOpen(false);
    setProductsOpen(false);
    setSubmenuOpen(false);
    setMobileProductsOpen(false);
    setMobileTruckBusOpen(false);
  };

  const closeDesktopMenus = useCallback(() => {
    clearProductsClose();
    clearSubmenuClose();
    setProductsOpen(false);
    setSubmenuOpen(false);
  }, [clearProductsClose, clearSubmenuClose]);

  /** Close when keyboard focus leaves the whole Products item. */
  const onProductsBlur = (event: React.FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      closeDesktopMenus();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/80 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
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
            className="h-6 w-auto sm:h-9 lg:h-10"
          />
        </Link>

        <nav aria-label={dict.header.primaryNav} className="hidden items-center lg:flex">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              if (!("children" in item)) {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={closeMenus}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
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
                  ref={productsRef}
                  className="relative"
                  onMouseEnter={openProducts}
                  onMouseLeave={() => {
                    scheduleProductsClose();
                    scheduleSubmenuClose();
                  }}
                  onBlur={onProductsBlur}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={productsOpen}
                    onClick={() => {
                      clearProductsClose();
                      setProductsOpen((open) => !open);
                    }}
                    onFocus={openProducts}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
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
                      "absolute left-1/2 top-full z-50 mt-3 w-[24rem] -translate-x-1/2 rounded-lg border border-ink-200 bg-white p-2 shadow-pop transition duration-150",
                      productsOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-1 opacity-0",
                    )}
                  >
                    <p className="px-3 pb-2 pt-2 text-sm font-semibold text-ink-400">
                      {dict.nav.productRanges}
                    </p>
                    <ul className="grid grid-cols-2 gap-0.5">
                      {item.children.map((child) => (
                        <li
                          key={child.label}
                          // Anchors the flyout to this item so it opens
                          // directly beside Truck & Bus (it may overlap the
                          // right column, and there is no gap to cross).
                          className={cn(child.children && "relative")}
                          onMouseEnter={
                            child.children
                              ? () => {
                                  openProducts();
                                  openSubmenu();
                                }
                              : scheduleSubmenuClose
                          }
                        >
                          {child.href ? (
                            <Link
                              href={child.href}
                              onClick={closeMenus}
                              onFocus={
                                child.children
                                  ? () => {
                                      openProducts();
                                      openSubmenu();
                                    }
                                  : undefined
                              }
                              className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-950"
                            >
                              <span>{child.label}</span>
                              {child.children && <ChevronRight />}
                            </Link>
                          ) : (
                            <span className="block rounded-lg px-3 py-2 text-sm text-ink-400">
                              {child.label}
                            </span>
                          )}

                          {child.children && (
                            <div
                              data-testid={`submenu-${child.label}`}
                              onMouseEnter={() => {
                                openProducts();
                                openSubmenu();
                              }}
                              onMouseLeave={scheduleSubmenuClose}
                              className={cn(
                                "absolute left-full top-0 z-50 w-60 rounded-lg border border-ink-200 bg-white p-2 shadow-pop transition duration-150",
                                submenuOpen
                                  ? "visible translate-x-0 opacity-100"
                                  : "invisible -translate-x-1 opacity-0",
                              )}
                            >
                              <p className="px-3 pb-2 pt-2 text-sm font-semibold text-ink-400">
                                {child.label}
                              </p>
                              <ul className="space-y-0.5">
                                {child.children.map((sub) => (
                                  <li key={sub.label}>
                                    {sub.href ? (
                                      <Link
                                        href={sub.href}
                                        onClick={closeMenus}
                                        className="block rounded-lg px-3 py-2 text-sm text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-950"
                                      >
                                        {sub.label}
                                      </Link>
                                    ) : (
                                      <span className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-ink-400">
                                        {sub.label}
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-300">
                                          {dict.common.comingSoon}
                                        </span>
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href={localizedHref(locale, ROUTES.search)}
            aria-label={dict.header.searchAria}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-950"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
          <LanguageSelector locale={locale} label={dict.language.label} />
          <Link
            href={localizedHref(locale, ROUTES.contactUs)}
            onClick={closeMenus}
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-brand-600 px-2.5 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-brand-700 sm:px-4 sm:text-sm"
          >
            {dict.common.requestQuotation}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-800 transition-colors hover:bg-ink-50 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={dict.header.openMenu}
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
            aria-label={dict.header.closeMenu}
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
                className="h-9 w-auto"
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label={dict.header.closeMenu}
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
              aria-label={dict.header.mobileNav}
              className="flex-1 overflow-y-auto px-3 py-4"
            >
              <Link
                href={localizedHref(locale, ROUTES.search)}
                onClick={closeMenus}
                className="mb-2 flex items-center gap-2.5 rounded-lg border border-ink-200 px-3.5 py-3 text-base font-medium text-ink-800 transition-colors hover:bg-ink-50"
              >
                <SearchIcon className="h-5 w-5 text-ink-500" />
                {dict.search.title}
              </Link>

              <ul className="space-y-0.5">
                {nav.map((item) => {
                  if (!("children" in item)) {
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={closeMenus}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "block rounded-lg px-3.5 py-3 text-base font-medium transition-colors",
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
                        className="flex w-full items-center justify-between rounded-lg px-3.5 py-3 text-base font-medium text-ink-800 transition-colors hover:bg-ink-50"
                      >
                        {item.label}
                        <Chevron open={mobileProductsOpen} />
                      </button>
                      {mobileProductsOpen && (
                        <ul className="mb-1 ml-3 space-y-0.5 border-l border-ink-200 pl-3">
                          {item.children.map((child) => {
                            if (child.children) {
                              return (
                                <li key={child.label}>
                                  <button
                                    type="button"
                                    aria-expanded={mobileTruckBusOpen}
                                    onClick={() =>
                                      setMobileTruckBusOpen((open) => !open)
                                    }
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-50"
                                  >
                                    {child.label}
                                    <Chevron open={mobileTruckBusOpen} />
                                  </button>
                                  {mobileTruckBusOpen && (
                                    <ul className="mb-1 ml-3 space-y-0.5 border-l border-ink-200 pl-3">
                                      {child.children.map((sub) => (
                                        <li key={sub.label}>
                                          {sub.href ? (
                                            <Link
                                              href={sub.href}
                                              onClick={closeMenus}
                                              className="block rounded-lg px-3 py-2 text-sm text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-950"
                                            >
                                              {sub.label}
                                            </Link>
                                          ) : (
                                            <span className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-ink-400">
                                              {sub.label}
                                              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-300">
                                                {dict.common.comingSoon}
                                              </span>
                                            </span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              );
                            }

                            return (
                              <li key={child.label}>
                                {child.href ? (
                                  <Link
                                    href={child.href}
                                    onClick={closeMenus}
                                    className="block rounded-lg px-3 py-2.5 text-sm text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-950"
                                  >
                                    {child.label}
                                  </Link>
                                ) : (
                                  <span className="block rounded-lg px-3 py-2.5 text-sm text-ink-400">
                                    {child.label}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="shrink-0 space-y-3 border-t border-ink-100 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
                  {dict.language.label}
                </span>
                <LanguageSelector locale={locale} label={dict.language.label} />
              </div>
              <ButtonLink
                href={localizedHref(locale, ROUTES.contactUs)}
                size="lg"
                shape="rounded-rectangle"
                className="w-full"
                onClick={closeMenus}
              >
                {dict.common.requestQuotation}
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

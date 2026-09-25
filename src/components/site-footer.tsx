import Image from "next/image";
import Link from "next/link";

import { ArrowIcon } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/catalogue/categories";
import { getPublicConfig } from "@/lib/config";
import { FOOTER_NAV, ROUTES } from "@/lib/routes";
import { SITE } from "@/lib/site";

function SocialIcon({ name }: { name: string }) {
  const common = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    className: "h-4 w-4",
  } as const;

  switch (name) {
    case "Instagram":
      return (
        <svg {...common}>
          <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.86s0 3.6-.07 4.86c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.86.07s-3.6 0-4.86-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.86c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.52.01-4.76.07-.9.04-1.39.19-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.13.32-.28.81-.32 1.71C3.4 8.48 3.4 8.85 3.4 12s0 3.52.07 4.76c.04.9.19 1.39.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.13.81.28 1.71.32 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.9-.04 1.39-.19 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.13-.32.28-.81.32-1.71.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.9-.19-1.39-.32-1.71a2.86 2.86 0 0 0-.69-1.06 2.86 2.86 0 0 0-1.06-.69c-.32-.13-.81-.28-1.71-.32C15.52 4.01 15.15 4 12 4Zm0 3.06A4.94 4.94 0 1 1 12 16.94 4.94 4.94 0 0 1 12 7.06Zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28Zm5.14-2.1a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z" />
        </svg>
      );
    case "Facebook":
      return (
        <svg {...common}>
          <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.54-1.5h1.65V3.6c-.29-.04-1.27-.12-2.4-.12-2.38 0-4 1.45-4 4.1v2.32H7.5V13h2.79v8h3.21Z" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg {...common}>
          <path d="M6.94 8.5H3.56V21h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 13.9c0-3.28-1.75-4.8-4.09-4.8-1.88 0-2.72 1.03-3.19 1.76V8.5H9.78c.04.95 0 12.5 0 12.5h3.38v-6.98c0-.3.02-.6.11-.82.24-.6.79-1.23 1.72-1.23 1.21 0 1.7.93 1.7 2.28V21h3.38v-7.1Z" />
        </svg>
      );
    case "X":
      return (
        <svg {...common}>
          <path d="M17.53 3h3.02l-6.6 7.54L21.75 21h-6.08l-4.76-6.23L5.45 21H2.42l7.06-8.07L2.25 3h6.23l4.3 5.69L17.53 3Zm-1.06 16.2h1.67L7.6 4.7H5.8l10.67 14.5Z" />
        </svg>
      );
    case "Pinterest":
      return (
        <svg {...common}>
          <path d="M12 2.2a9.8 9.8 0 0 0-3.57 18.93c-.09-.8-.17-2.03.03-2.9.19-.8 1.2-5.1 1.2-5.1s-.3-.61-.3-1.51c0-1.42.82-2.48 1.85-2.48.87 0 1.29.66 1.29 1.44 0 .88-.56 2.2-.85 3.42-.24 1.02.51 1.86 1.52 1.86 1.83 0 3.23-1.93 3.23-4.71 0-2.46-1.77-4.18-4.3-4.18-2.93 0-4.65 2.2-4.65 4.47 0 .88.34 1.83.76 2.35.08.1.1.19.07.29l-.29 1.15c-.04.19-.15.23-.35.14-1.28-.6-2.08-2.47-2.08-3.97 0-3.23 2.35-6.2 6.77-6.2 3.56 0 6.32 2.53 6.32 5.92 0 3.53-2.23 6.38-5.32 6.38-1.04 0-2.01-.54-2.35-1.18l-.64 2.43c-.23.89-.85 2-1.27 2.68A9.8 9.8 0 1 0 12 2.2Z" />
        </svg>
      );
    case "WhatsApp":
      return (
        <svg {...common}>
          <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2.1 22l5.34-1.4a9.8 9.8 0 0 0 4.6 1.17h.01c5.43 0 9.85-4.4 9.85-9.85C21.9 6.4 17.48 2 12.04 2Zm0 17.96h-.01a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.06.8.82-2.99-.19-.3a8.09 8.09 0 0 1-1.24-4.32c0-4.48 3.65-8.13 8.13-8.13 2.17 0 4.2.85 5.74 2.38a8.07 8.07 0 0 1 2.38 5.75c0 4.48-3.65 8.12-8.14 8.12Zm4.46-6.08c-.24-.12-1.45-.72-1.67-.8-.22-.08-.39-.12-.55.12-.16.24-.63.8-.77.96-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.44-1.35-1.68-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 1.99 0 1.18.86 2.31.98 2.47.12.16 1.69 2.58 4.09 3.62.57.25 1.02.4 1.37.5.57.18 1.09.16 1.5.1.46-.07 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
        </svg>
      );
    default:
      return null;
  }
}

function FooterHeading({ children }: { children: string }) {
  return <h2 className="text-sm font-semibold text-white/70">{children}</h2>;
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-white/65 transition-colors hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}

export function SiteFooter() {
  const { socialLinks } = getPublicConfig();
  const year = new Date().getFullYear();

  const socials = [
    ...socialLinks,
    { name: "WhatsApp", url: SITE.whatsappUrl },
  ];

  return (
    <footer className="bg-ink-50 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem] overflow-hidden rounded-card bg-ink-950 text-white">
        <div className="px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-h2 text-white">
                Sourcing Tyres?
                <br />
                Start the Conversation.
              </h2>
            </div>
            <div className="shrink-0">
              <a
                href={`mailto:${SITE.emails.director}`}
                className="group inline-flex items-center gap-4"
              >
                <span className="text-lg font-semibold tracking-tight break-all sm:text-xl lg:text-2xl">
                  {SITE.emails.director}
                </span>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-white transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowIcon className="h-4 w-4" />
                </span>
              </a>
              <p className="mt-3 text-sm text-white/50">{SITE.legalName}</p>
            </div>
          </div>

          <div className="mt-14 grid gap-10 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-4">
              <Image
                src="/brand/safeway-logo-white.png"
                alt={SITE.name}
                width={180}
                height={42}
                className="h-9 w-auto"
              />
              <p className="max-w-xs text-sm leading-relaxed text-white/55">
                {SITE.tagline}. Manufactured in India and exported worldwide.
              </p>
              <address className="max-w-xs space-y-4 not-italic">
                {SITE.addresses.map((location) => (
                  <div key={location.label}>
                    <p className="text-sm font-semibold text-white/75">
                      {location.label}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">
                      {location.lines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </address>
              <div className="flex flex-wrap gap-2 pt-1">
                {socials.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-accent-500 hover:bg-accent-500 hover:text-white"
                  >
                    <SocialIcon name={link.name} />
                    <span className="sr-only">
                      {`${SITE.name} on ${link.name}`}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <nav aria-label="Products" className="lg:col-span-3">
              <FooterHeading>Products</FooterHeading>
              <ul className="mt-5 space-y-3">
                {CATEGORIES.map((category) => (
                  <FooterLink
                    key={category.slug}
                    href={ROUTES.category(category.slug)}
                  >
                    {category.displayName}
                  </FooterLink>
                ))}
              </ul>
            </nav>

            <nav aria-label="Company" className="lg:col-span-2">
              <FooterHeading>Company</FooterHeading>
              <ul className="mt-5 space-y-3">
                {FOOTER_NAV.map((item) => (
                  <FooterLink key={item.href} href={item.href}>
                    {item.label}
                  </FooterLink>
                ))}
              </ul>
            </nav>

            <div className="lg:col-span-3">
              <FooterHeading>Contact</FooterHeading>
              <ul className="mt-5 space-y-3 text-sm text-white/65">
                <li>
                  <a
                    href={`mailto:${SITE.emails.director}`}
                    className="transition-colors hover:text-white"
                  >
                    {SITE.emails.director}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${SITE.emails.marketing}`}
                    className="transition-colors hover:text-white"
                  >
                    {SITE.emails.marketing}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${SITE.phone.primary.replace(/\s/g, "")}`}
                    className="transition-colors hover:text-white"
                  >
                    {SITE.phone.primary}
                  </a>
                </li>
              </ul>
              <p className="mt-6 text-sm text-white/50">
                {SITE.openingHours.days}
                <br />
                {SITE.openingHours.hours}
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {SITE.legalName}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Link
                href={ROUTES.contactUs}
                className="transition-colors hover:text-white"
              >
                Contact Us
              </Link>
              <Link
                href={ROUTES.catalogue}
                className="transition-colors hover:text-white"
              >
                Catalogue
              </Link>
              <a
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

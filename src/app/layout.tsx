import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/site";

import { anekDevanagari, inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://safewaytyre.com"),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Safeway Tyre is a tyre manufacturer in India, exporting truck, bus, agriculture, motorcycle, three-wheeler, industrial and OTR tyres worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${anekDevanagari.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-white text-ink-700 antialiased">
        <noscript>
          {/* Without JS, scroll-reveal content must still be visible. */}
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

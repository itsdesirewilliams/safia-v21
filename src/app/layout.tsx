import type { Metadata } from "next";

import { localeDir } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { SITE } from "@/lib/site";
import { getActiveTheme } from "@/lib/theme/persistence";

import { anekDevanagari, monaSans, monaSansCondensed } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://safewaytyre.com"),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Safeway Tyre is a tyre manufacturer in India, exporting truck, bus, agriculture, motorcycle, three-wheeler, industrial and OTR tyres worldwide.",
  // Existing Safeway Tyre brand icons under `public/brand/` (no duplicates).
  icons: {
    icon: [
      { url: "/brand/favicon.ico" },
      { url: "/brand/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      {
        url: "/brand/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  manifest: "/brand/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [theme, locale] = await Promise.all([getActiveTheme(), getLocale()]);

  return (
    <html
      lang={locale}
      dir={localeDir(locale)}
      data-theme={theme}
      className={`${monaSans.variable} ${monaSansCondensed.variable} ${anekDevanagari.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-white text-ink-700 antialiased">
        <noscript>
          {/* Without JS, scroll-reveal content must still be visible. */}
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}

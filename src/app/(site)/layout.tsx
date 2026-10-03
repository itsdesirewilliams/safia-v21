import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageTransition } from "@/components/ui/page-transition";
import { getDictionary, getLocale } from "@/lib/i18n/server";

/** The public site chrome. Admin routes deliberately sit outside this group. */
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <>
      <SiteHeader locale={locale} dict={dict} />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter locale={locale} dict={dict} />
    </>
  );
}

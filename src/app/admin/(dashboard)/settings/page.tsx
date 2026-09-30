import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { THEMES } from "@/lib/theme/config";
import { getActiveTheme } from "@/lib/theme/persistence";

import { setThemeAction } from "./actions";

export const metadata = { title: "Settings" };

type AdminSettingsPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

/**
 * Admin → Settings. Currently exposes the public website theme. Admin-only
 * (`requireAdmin`); the theme applies site-wide and is cached, so saving it
 * takes effect for every visitor without a rebuild or redeploy.
 */
export default async function AdminSettingsPage({
  searchParams,
}: AdminSettingsPageProps) {
  await requireAdmin();

  const [activeTheme, params] = await Promise.all([
    getActiveTheme(),
    searchParams,
  ]);

  return (
    <div className="py-12">
      <Container size="narrow">
        <h1 className="text-h2 text-ink-950">Site settings</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
          Choose the theme applied to the public website. Saving takes effect
          for every visitor — no rebuild or redeploy — and is remembered across
          page loads and sessions.
        </p>

        {params.saved && (
          <p
            role="status"
            className="mt-6 rounded-lg border border-success-600/30 bg-success-600/5 px-4 py-3 text-sm font-medium text-success-600"
          >
            Theme updated.
          </p>
        )}

        {params.error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-accent-600/30 bg-accent-600/5 px-4 py-3 text-sm font-medium text-accent-700"
          >
            {params.error === "invalid"
              ? "That theme is not recognized."
              : "Could not save the theme. Make sure the site settings migration has been applied."}
          </p>
        )}

        <form action={setThemeAction} className="mt-8">
          <fieldset>
            <legend className="sr-only">Active theme</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {THEMES.map((theme) => (
                <label
                  key={theme.id}
                  className={cn(
                    "flex cursor-pointer gap-4 rounded-card border border-ink-200 bg-white p-5 transition-colors",
                    "hover:border-ink-300 has-[:checked]:border-brand-600 has-[:checked]:ring-2 has-[:checked]:ring-brand-500/30",
                  )}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={theme.id}
                    defaultChecked={theme.id === activeTheme}
                    className="mt-1 h-4 w-4 accent-brand-600"
                  />
                  <span>
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="inline-block h-4 w-4 rounded-full border border-ink-200"
                        style={{ backgroundColor: theme.swatch }}
                      />
                      <span className="text-sm font-semibold text-ink-950">
                        {theme.label}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-600">
                      {theme.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-8">
            <button type="submit" className={buttonStyles("primary", "md")}>
              Save theme
            </button>
          </div>
        </form>
      </Container>
    </div>
  );
}

export const ADMIN_THEME_STORAGE_KEY = "safeway-admin-theme";

export const ADMIN_THEME_SCRIPT = `(function(){try{var k="${ADMIN_THEME_STORAGE_KEY}";var v=localStorage.getItem(k)||"system";var d=v==="dark"||(v==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.dataset.adminTheme=d?"dark":"light";r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

/**
 * Runs before the admin shell paints, so the persisted/system theme is applied
 * without a light flash. This is intentionally a tiny blocking script rather
 * than an external theme package.
 */
export function AdminThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: ADMIN_THEME_SCRIPT }}
      suppressHydrationWarning
    />
  );
}

"use client";

import { usePathname } from "next/navigation";

/**
 * A lightweight page-enter transition. The wrapper is keyed by pathname, so each
 * navigation remounts it and replays a short CSS fade. There is no routing
 * library and no exit phase — content is never blocked, and reduced-motion users
 * see it instantly (animations are neutralised globally). Existing page
 * behaviour is untouched.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}

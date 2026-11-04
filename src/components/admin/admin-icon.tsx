import type { SVGProps } from "react";

import { cn } from "@/lib/cn";

const ICON_PATHS = {
  dashboard:
    "M3.75 3.75h6v6h-6zM14.25 3.75h6v6h-6zM3.75 14.25h6v6h-6zM14.25 14.25h6v6h-6z",
  posts:
    "M6 4.5h12a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.5 18V6A1.5 1.5 0 0 1 6 4.5ZM8.25 9h7.5M8.25 12h7.5M8.25 15h4.5",
  media:
    "M3.75 6.75h16.5v10.5H3.75zM3.75 15l4.5-4.5 3.75 3.75 2.25-2.25 4.5 4.5M14.25 9.75h.008v.008h-.008z",
  gallery:
    "M4.5 5.25h15v10.5h-15zM8.25 20.25l3.75-3 3 2.25 3.75-4.5M9.75 9h.008v.008H9.75z",
  pattern:
    "M12 3.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5ZM12 7.5v4.5l3 1.5M8.25 12h.008M15.75 12h.008",
  quality:
    "M9 12.75 11 14.5l4-4.5M12 3l6.75 3v5.25c0 4.28-2.9 8.13-6.75 9.75-3.85-1.62-6.75-5.47-6.75-9.75V6L12 3Z",
  appearance:
    "M12 3.75a8.25 8.25 0 0 0 0 16.5c1.14 0 1.65-.74 1.65-1.5 0-.39-.14-.68-.38-.98-.24-.3-.38-.6-.38-1 0-.84.68-1.52 1.52-1.52h1.09A4.5 4.5 0 0 0 20.25 10.5C20.25 6.77 16.56 3.75 12 3.75ZM7.5 12a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25Zm3-3.75a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25Zm4.5 0a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25Z",
  users:
    "M15 19.5v-1.5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v1.5M9 11.25a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12 8.25v-1.5a3 3 0 0 0-2.25-2.9M16.5 5.34a3 3 0 0 1 0 5.82",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  panelLeft: "M4.5 4.5h15v15h-15zM9.75 4.5v15",
  chevronDown: "m7 10 5 5 5-5",
  chevronRight: "m9 6 6 6-6 6",
  sun: "M12 4.5v-1.5M12 21v-1.5M4.5 12H3M21 12h-1.5M6.7 6.7 5.64 5.64M18.36 18.36l-1.06-1.06M17.3 6.7l1.06-1.06M5.64 18.36 6.7 17.3M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z",
  moon: "M20.25 14.25A8.25 8.25 0 0 1 9.75 3.75a8.25 8.25 0 1 0 10.5 10.5Z",
  monitor: "M3.75 4.5h16.5v11.25H3.75zM8.25 20.25h7.5M12 15.75v4.5",
  check: "m5 12 4.5 4.5L19 7",
} as const;

export type AdminIconName = keyof typeof ICON_PATHS;

export function AdminIcon({
  name,
  className,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: AdminIconName;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      {...props}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

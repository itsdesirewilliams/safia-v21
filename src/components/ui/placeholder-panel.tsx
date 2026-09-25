import { cn } from "@/lib/cn";

export type PlaceholderKind =
  | "video"
  | "certification"
  | "testimonial"
  | "media"
  | "location";

type IconConfig = { path: React.ReactNode };

const ICONS: Record<PlaceholderKind, IconConfig> = {
  video: {
    path: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5 20 7.5v9l-5-3m-9.75 3h9.5A2.25 2.25 0 0 0 17 14.25v-4.5A2.25 2.25 0 0 0 14.75 7.5h-9.5A2.25 2.25 0 0 0 3 9.75v4.5A2.25 2.25 0 0 0 5.25 16.5Z"
      />
    ),
  },
  certification: {
    path: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11 14.5l4-4.5"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3l6.75 3v5.25c0 4.28-2.9 8.13-6.75 9.75-3.85-1.62-6.75-5.47-6.75-9.75V6L12 3Z"
        />
      </>
    ),
  },
  testimonial: {
    path: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h1.5c.83 0 1.5.67 1.5 1.5v1.5c0 .83-.67 1.5-1.5 1.5H8.25c0 1.24 1.01 2.25 2.25 2.25M14.25 8.25h1.5c.83 0 1.5.67 1.5 1.5v1.5c0 .83-.67 1.5-1.5 1.5H15c0 1.24 1.01 2.25 2.25 2.25"
      />
    ),
  },
  media: {
    path: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5v10.5H3.75z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m3.75 15 4.5-4.5 3.75 3.75 2.25-2.25 4.5 4.5"
        />
        <circle cx="14.25" cy="9.75" r="0.75" />
      </>
    ),
  },
  location: {
    path: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21s6.75-5.4 6.75-10.5a6.75 6.75 0 1 0-13.5 0C5.25 15.6 12 21 12 21Z"
        />
        <circle cx="12" cy="10.5" r="2.25" />
      </>
    ),
  },
};

export type PlaceholderPanelProps = {
  label: string;
  detail: string;
  kind?: PlaceholderKind;
  tone?: "light" | "dark";
  className?: string;
};

/**
 * A deliberate, premium-labelled stand-in for a section whose external input
 * has not been supplied. It states exactly what is missing and never invents
 * content.
 */
export function PlaceholderPanel({
  label,
  detail,
  kind = "media",
  tone = "light",
  className,
}: PlaceholderPanelProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-card border border-dashed p-6 sm:p-8",
        tone === "light"
          ? "border-ink-300 bg-ink-50"
          : "border-white/15 bg-white/[0.03]",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
          tone === "light"
            ? "bg-white text-ink-700 shadow-soft"
            : "bg-white/10 text-white/80",
        )}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-5 w-5"
        >
          {ICONS[kind].path}
        </svg>
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-semibold",
            tone === "light" ? "text-ink-950" : "text-white",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "mt-1.5 max-w-2xl text-sm leading-relaxed",
            tone === "light" ? "text-ink-600" : "text-white/60",
          )}
        >
          {detail}
        </p>
      </div>
    </div>
  );
}

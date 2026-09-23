import { cn } from "@/lib/cn";

export type EyebrowProps = {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
};

/**
 * Section label chip. Small, uppercase, tracked — the recurring editorial
 * marker across the site.
 */
export function Eyebrow({ children, tone = "light", className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "text-eyebrow inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5",
        tone === "light"
          ? "border-ink-200 bg-white text-ink-600"
          : "border-white/15 bg-white/5 text-white/70",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-accent-500"
      />
      {children}
    </span>
  );
}

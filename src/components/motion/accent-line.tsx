import { cn } from "@/lib/cn";

/**
 * AccentLine — the small orange punctuation rule. Rendered statically: it is
 * visible immediately and no longer starts at `scaleX: 0, opacity: 0`.
 */
export function AccentLine({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "block h-0.5 w-12 origin-left rounded-full bg-accent-500",
        className,
      )}
    />
  );
}

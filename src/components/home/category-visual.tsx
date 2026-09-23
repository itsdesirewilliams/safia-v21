import { cn } from "@/lib/cn";

export type CategoryVisualProps = {
  /** Zero-based position, rendered as `/01`. */
  index: number;
  label: string;
  className?: string;
};

/**
 * A designed, clearly-temporary visual for a product range while supplied
 * category photography is unavailable. It is a branded abstract tyre-ring
 * motif — not a stock photo and not old-site material — and is replaced by
 * real imagery when Safeway supplies it.
 */
export function CategoryVisual({ index, label, className }: CategoryVisualProps) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-ink-950",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 [background:radial-gradient(120%_120%_at_85%_0%,rgba(11,99,246,0.38),transparent_55%),radial-gradient(80%_80%_at_0%_110%,rgba(255,106,0,0.16),transparent_55%)]"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 240 240"
        fill="none"
        className="absolute -right-12 -top-12 h-56 w-56 text-white/[0.07] transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
      >
        <g stroke="currentColor" strokeWidth="2">
          <circle cx="120" cy="120" r="46" />
          <circle cx="120" cy="120" r="72" />
          <circle cx="120" cy="120" r="98" />
          <circle cx="120" cy="120" r="118" />
        </g>
      </svg>
      <span className="text-eyebrow absolute left-5 top-5 text-white/45">
        {`/0${index + 1}`}
      </span>
      <span className="absolute bottom-5 left-5 right-5 text-base font-semibold tracking-tight text-white">
        {label}
      </span>
    </div>
  );
}

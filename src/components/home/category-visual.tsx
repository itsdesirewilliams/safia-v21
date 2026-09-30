import Image from "next/image";

import { cn } from "@/lib/cn";

export type CategoryVisualProps = {
  label: string;
  /** Supplied range image URL, or `null` to keep the designed placeholder. */
  image?: string | null;
  className?: string;
};

/**
 * A product-range visual. When a supplied image exists it is shown in the fixed
 * 4:3 tile; otherwise a designed, clearly-temporary branded tyre-ring motif is
 * used until Safeway supplies the photography. Either way the range name is
 * overlaid on the tile.
 */
export function CategoryVisual({
  label,
  image,
  className,
}: CategoryVisualProps) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] overflow-hidden rounded-lg bg-ink-950",
        className,
      )}
    >
      {image ? (
        <>
          <Image
            src={image}
            alt={label}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent"
          />
        </>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 [background:radial-gradient(120%_120%_at_85%_0%,color-mix(in_srgb,var(--color-primary)_38%,transparent),transparent_55%),radial-gradient(80%_80%_at_0%_110%,color-mix(in_srgb,var(--color-accent)_16%,transparent),transparent_55%)]"
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
        </>
      )}

      <span className="absolute bottom-5 left-5 right-5 text-base font-semibold tracking-tight text-white">
        {label}
      </span>
    </div>
  );
}

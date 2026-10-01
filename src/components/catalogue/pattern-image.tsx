import { cn } from "@/lib/cn";

export type PatternImageProps = {
  /** Pattern-level image URL, or `null` when the Pattern has none yet. */
  src: string | null;
  alt: string;
  className?: string;
};

/**
 * The Pattern-level media box. It preserves the image's aspect ratio
 * (`object-contain`), so nothing is distorted or unnecessarily cropped, and
 * falls back to a clean neutral mark when a Pattern has no image — never an
 * invented one. Pattern-level media is deliberately separate from Variant
 * imagery.
 */
export function PatternImage({ src, alt, className }: PatternImageProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-ink-50",
        className,
      )}
    >
      {src ? (
        // Arbitrary aspect ratios are preserved; next/image would need fixed
        // intrinsic dimensions. Same approach as the Gallery grid.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-contain p-1.5"
        />
      ) : (
        <span className="flex flex-col items-center justify-center gap-1 text-ink-400">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-6 w-6"
          >
            <circle cx="12" cy="12" r="8.25" />
            <circle cx="12" cy="12" r="3" />
            <path
              strokeLinecap="round"
              d="M12 3.75v3M12 17.25v3M3.75 12h3M17.25 12h3"
            />
          </svg>
          <span className="sr-only">Pattern image coming soon</span>
        </span>
      )}
    </div>
  );
}

import { AccentLine } from "@/components/motion/accent-line";
import { cn } from "@/lib/cn";

export type SectionHeadingProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  /** Heading level to render; defaults to `h2`. */
  as?: "h1" | "h2";
  className?: string;
  /** Show the small orange accent rule above the heading. */
  accentLine?: boolean;
};

/** The recurring heading → description block. */
export function SectionHeading({
  title,
  description,
  tone = "light",
  align = "left",
  as: Heading = "h2",
  className,
  accentLine = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {accentLine && <AccentLine className="mb-5" />}
      <Heading
        className={cn(
          "text-h2 max-w-3xl text-balance",
          tone === "light" ? "text-ink-950" : "text-white",
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            "mt-4 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg",
            tone === "light" ? "text-ink-600" : "text-white/65",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

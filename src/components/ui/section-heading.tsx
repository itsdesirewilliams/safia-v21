import { cn } from "@/lib/cn";

export type SectionHeadingProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
};

/** The recurring heading → description block. */
export function SectionHeading({
  title,
  description,
  tone = "light",
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <h2
        className={cn(
          "text-h2 max-w-3xl text-balance",
          tone === "light" ? "text-ink-950" : "text-white",
        )}
      >
        {title}
      </h2>
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

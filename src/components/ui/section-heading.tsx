import { cn } from "@/lib/cn";

import { Eyebrow } from "./eyebrow";

export type SectionHeadingProps = {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
};

/** The recurring eyebrow → heading → description block. */
export function SectionHeading({
  eyebrow,
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
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2
        className={cn(
          "text-h2 mt-5 max-w-3xl text-balance",
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

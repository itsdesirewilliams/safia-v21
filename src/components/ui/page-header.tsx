import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Small uppercase label shown above the title (taxonomy). */
  eyebrow?: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Match the header measure to a page's content container. */
  containerSize?: "default" | "wide" | "narrow" | "listing";
};

/**
 * The shared sub-page header. It deliberately avoids the large dark homepage
 * hero: a light band with a hairline rule, a moderate heading and an optional
 * description, breadcrumb, actions or extra content. Pages pass their own copy,
 * so each header still reads as that page's own.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumb,
  actions,
  children,
  className,
  containerSize = "default",
}: PageHeaderProps) {
  // The listing pages use a wide container, so the hero copy is allowed a wider
  // measure — otherwise a two-sentence description wraps to three lines on
  // desktop despite the space available.
  const wide = containerSize === "listing";

  return (
    <header className={cn("border-b border-ink-200 bg-ink-50", className)}>
      <Container size={containerSize} className="py-12 lg:py-16">
        {breadcrumb && <div className="mb-6">{breadcrumb}</div>}
        {eyebrow && (
          <p className="text-eyebrow text-brand-600">{eyebrow}</p>
        )}
        <h1
          className={cn(
            "text-balance text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl",
            wide ? "max-w-4xl" : "max-w-3xl",
            eyebrow ? "mt-3" : undefined,
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "mt-4 text-base leading-relaxed text-pretty text-ink-600 sm:text-lg",
              wide ? "max-w-4xl" : "max-w-2xl",
            )}
          >
            {description}
          </p>
        )}
        {children}
        {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
      </Container>
    </header>
  );
}

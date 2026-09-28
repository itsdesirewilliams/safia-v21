import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
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
  breadcrumb,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("border-b border-ink-200 bg-ink-50", className)}>
      <Container className="py-12 lg:py-16">
        {breadcrumb && <div className="mb-6">{breadcrumb}</div>}
        <h1 className="max-w-3xl text-balance text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
            {description}
          </p>
        )}
        {children}
        {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
      </Container>
    </header>
  );
}

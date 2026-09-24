import Link from "next/link";

import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "dark"
  | "outline"
  | "onDark";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonShape = "pill" | "rounded-rectangle";

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold transition-[background-color,border-color,color,transform] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]";

const SHAPES: Record<ButtonShape, string> = {
  pill: "rounded-full",
  "rounded-rectangle": "rounded-lg",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  accent: "bg-accent-500 text-white hover:bg-accent-600",
  dark: "bg-ink-950 text-white hover:bg-ink-800",
  outline:
    "border border-ink-200 bg-white text-ink-900 hover:border-ink-300 hover:bg-ink-50",
  onDark:
    "border border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export function buttonStyles(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
  shape: ButtonShape = "pill",
): string {
  return cn(BASE, SHAPES[shape], VARIANTS[variant], SIZES[size], className);
}

export type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

/** Pill CTA rendered as a link (next/link for internal, <a> for external). */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  shape = "pill",
  className,
  target,
  rel,
  ...rest
}: ButtonLinkProps) {
  const classes = buttonStyles(variant, size, className, shape);

  if (/^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={classes} target={target} rel={rel} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5"
      />
    </svg>
  );
}

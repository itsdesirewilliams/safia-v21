import { cn } from "@/lib/cn";

export type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** Narrower measure for text-led pages. */
  size?: "default" | "wide" | "narrow";
};

const SIZES = {
  narrow: "max-w-4xl",
  default: "max-w-7xl",
  wide: "max-w-[96rem]",
} as const;

/** The single horizontal container/grid gutter for the whole site. */
export function Container({
  children,
  className,
  size = "default",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        SIZES[size],
        className,
      )}
    >
      {children}
    </div>
  );
}

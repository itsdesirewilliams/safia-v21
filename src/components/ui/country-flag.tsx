import * as Flags from "country-flag-icons/react/3x2";

import { cn } from "@/lib/cn";

/**
 * A deterministic country flag, rendered as an SVG (never a Unicode emoji).
 *
 * Emoji flags depend on the operating system's emoji font and render as "IN",
 * "BR", etc. on Windows Chrome, so the homepage testimonials were inconsistent
 * across desktop and mobile. This uses a self-hosted SVG set keyed by ISO
 * 3166-1 alpha-2 code, so the same flag renders everywhere.
 *
 * Unknown codes degrade to a neutral, aligned placeholder rather than an emoji.
 */

type FlagComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { title?: string }
>;

const FLAG_MAP = Flags as unknown as Record<string, FlagComponent>;

export function CountryFlag({
  code,
  country,
  className,
}: {
  code: string | null;
  country: string;
  className?: string;
}) {
  const Flag = code ? FLAG_MAP[code.toUpperCase()] : undefined;

  if (!Flag) {
    return (
      <span
        data-country-flag={code ?? "unknown"}
        aria-hidden="true"
        className={cn(
          "inline-block h-3.5 w-[1.3125rem] rounded-[2px] border border-ink-200 bg-ink-100 align-[-2px]",
          className,
        )}
      />
    );
  }

  return (
    <span
      data-country-flag={code?.toUpperCase()}
      className={cn("inline-block align-[-2px]", className)}
    >
      <Flag
        title={country}
        className="block h-3.5 w-auto rounded-[2px] border border-black/10 shadow-soft"
      />
    </span>
  );
}

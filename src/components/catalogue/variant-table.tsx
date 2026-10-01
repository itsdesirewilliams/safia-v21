import type { NormalizedVariant } from "@/lib/catalogue/normalize";

type VariantColumn = {
  key: string;
  /** Full header on desktop. */
  label: string;
  /** Abbreviated header on narrow screens where the full label would not fit. */
  shortLabel: string;
  value: (variant: NormalizedVariant) => string | null;
};

/**
 * The public specification columns (spec #1). Size is always shown; the
 * Forklift-only columns (rim width, tread, tyre type) appear only when the
 * Pattern actually carries them.
 */
const COLUMNS: readonly VariantColumn[] = [
  {
    key: "size",
    label: "Size",
    shortLabel: "Size",
    value: (variant) => variant.public.size,
  },
  {
    key: "plyRating",
    label: "Ply rating",
    shortLabel: "Ply",
    value: (variant) => variant.public.plyRating,
  },
  {
    key: "ttTl",
    label: "TT/TL",
    shortLabel: "TT/TL",
    value: (variant) => variant.public.ttTl,
  },
  {
    key: "application",
    label: "Application",
    shortLabel: "App.",
    value: (variant) => variant.public.application,
  },
  {
    key: "rimWidthInch",
    label: "Rim width (in)",
    shortLabel: "Rim",
    value: (variant) => variant.public.rimWidthInch,
  },
  {
    key: "tread",
    label: "Tread",
    shortLabel: "Tread",
    value: (variant) => variant.public.tread,
  },
  {
    key: "tyreType",
    label: "Tyre type",
    shortLabel: "Type",
    value: (variant) => variant.public.tyreType,
  },
];

/**
 * The Variant specification table shown on a Pattern page (no Variant routes).
 *
 * A fixed layout keeps every column inside the viewport on narrow screens:
 * desktop keeps the comfortable spacing and full headers, while mobile uses a
 * compact type scale, tighter padding, abbreviated headers and wrapping cells —
 * so the whole table is always visible with no horizontal scrolling.
 */
export function VariantTable({
  variants,
}: {
  variants: readonly NormalizedVariant[];
}) {
  const columns = COLUMNS.filter(
    (column) =>
      column.key === "size" ||
      variants.some((variant) => column.value(variant) !== null),
  );

  return (
    <div className="rounded-card border border-ink-200">
      <table className="w-full table-fixed border-collapse text-left text-xs sm:text-sm">
        <caption className="sr-only">
          Specification table of Variants for this Pattern
        </caption>
        <thead className="bg-ink-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-2 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500 sm:px-4 sm:py-3 sm:text-xs sm:tracking-[0.14em]"
              >
                <span className="sm:hidden">{column.shortLabel}</span>
                <span className="hidden sm:inline">{column.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {variants.map((variant, index) => (
            <tr
              key={`${variant.public.size}-${index}`}
              className="border-t border-ink-200 even:bg-ink-50/60"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="break-words px-2 py-2.5 align-top text-ink-700 [overflow-wrap:anywhere] sm:px-4 sm:py-3"
                >
                  {column.value(variant) ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

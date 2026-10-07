import type { RangeVariant } from "@/lib/catalogue/range-data";

type RangeColumn = {
  key: string;
  /** Full header on desktop. */
  label: string;
  /** Abbreviated header on narrow screens. */
  shortLabel: string;
  value: (variant: RangeVariant) => string | number | null;
};

/**
 * The public specification columns for the radial ranges (TBR / PCR):
 * Size, Application, LI/SR and CC (the source QTY/40HQ). Commercial fields are
 * never included.
 */
const COLUMNS: readonly RangeColumn[] = [
  { key: "size", label: "Size", shortLabel: "Size", value: (v) => v.size },
  {
    key: "application",
    label: "Application",
    shortLabel: "App.",
    value: (v) => v.application,
  },
  { key: "liSr", label: "LI/SR", shortLabel: "LI/SR", value: (v) => v.liSr },
  { key: "cc", label: "CC", shortLabel: "CC", value: (v) => v.cc },
];

/**
 * The variant specification table for a radial range Pattern. Mirrors the
 * shared `VariantTable` styling: a fixed layout keeps every column inside the
 * viewport on mobile with no horizontal scrolling.
 */
export function RangeSpecTable({
  variants,
}: {
  variants: readonly RangeVariant[];
}) {
  return (
    <div className="rounded-card border border-ink-200">
      <table className="w-full table-fixed border-collapse text-left text-xs sm:text-sm">
        <caption className="sr-only">
          Specification table of variants for this pattern
        </caption>
        <thead className="bg-ink-50">
          <tr>
            {COLUMNS.map((column) => (
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
              key={`${variant.size}-${index}`}
              className="border-t border-ink-200 even:bg-ink-50/60"
            >
              {COLUMNS.map((column) => (
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

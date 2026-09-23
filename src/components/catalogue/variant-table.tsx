import type { NormalizedVariant } from "@/lib/catalogue/normalize";

type VariantColumn = {
  key: string;
  label: string;
  value: (variant: NormalizedVariant) => string | null;
};

/**
 * The public specification columns (spec #1). Size is always shown; the
 * Forklift-only columns (rim width, tread, tyre type) appear only when the
 * Pattern actually carries them.
 */
const COLUMNS: readonly VariantColumn[] = [
  { key: "size", label: "Size", value: (variant) => variant.public.size },
  {
    key: "plyRating",
    label: "Ply rating",
    value: (variant) => variant.public.plyRating,
  },
  { key: "ttTl", label: "TT/TL", value: (variant) => variant.public.ttTl },
  {
    key: "application",
    label: "Application",
    value: (variant) => variant.public.application,
  },
  {
    key: "rimWidthInch",
    label: "Rim width (in)",
    value: (variant) => variant.public.rimWidthInch,
  },
  { key: "tread", label: "Tread", value: (variant) => variant.public.tread },
  {
    key: "tyreType",
    label: "Tyre type",
    value: (variant) => variant.public.tyreType,
  },
];

/** The Variant specification table shown on a Pattern page (no Variant routes). */
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
    <div className="overflow-x-auto rounded-card border border-ink-200">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          Specification table of Variants for this Pattern
        </caption>
        <thead className="bg-ink-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500"
              >
                {column.label}
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
                  className="whitespace-nowrap px-4 py-3 text-ink-700"
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

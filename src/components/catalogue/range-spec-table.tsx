import {
  CatalogueSizeTable,
  type CatalogueSizeColumn,
  type CatalogueSizeRow,
} from "@/components/catalogue/catalogue-size-table";
import type { RangeVariant } from "@/lib/catalogue/range-data";
import type { CatalogueSelectionContext } from "@/lib/catalogue/selection";

type RangeColumn = CatalogueSizeColumn & {
  value: (variant: RangeVariant) => string | number | null;
};

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
 * A radial-range Pattern's Variants as the shared catalogue size table, so
 * TBR/PCR use the same search, selection, copy and responsive behaviour as the
 * rest of the catalogue.
 */
export function RangeSpecTable({
  variants,
  selection,
}: {
  variants: readonly RangeVariant[];
  selection?: CatalogueSelectionContext;
}) {
  const rows: CatalogueSizeRow[] = variants.map((variant, index) => ({
    id: `${variant.size}-${index}`,
    size: variant.size,
    cells: {
      size: variant.size,
      application: variant.application,
      liSr: variant.liSr,
      cc: variant.cc === null ? null : String(variant.cc),
    },
    applications: variant.application ? [variant.application] : [],
  }));

  return (
    <CatalogueSizeTable
      columns={COLUMNS.map(({ key, label, shortLabel }) => ({
        key,
        label,
        shortLabel,
      }))}
      rows={rows}
      selectionContext={selection}
      caption="Specification table of variants for this pattern"
      searchPlaceholder="Search sizes"
      emptyLabel="No size in this pattern matches that search."
    />
  );
}

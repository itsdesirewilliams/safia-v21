import {
  CatalogueSizeTable,
  type CatalogueSizeColumn,
  type CatalogueSizeRow,
} from "@/components/catalogue/catalogue-size-table";
import type { NormalizedVariant } from "@/lib/catalogue/normalize";
import type { CatalogueSelectionContext } from "@/lib/catalogue/selection";

type VariantColumn = CatalogueSizeColumn & {
  value: (variant: NormalizedVariant) => string | null;
};

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
 * A Pattern's Variants as the shared catalogue size table. The same search,
 * selection, copy and mobile treatment is used by every catalogue detail page;
 * Forklift-only columns appear only when the Pattern carries them.
 */
export function VariantTable({
  variants,
  labels,
  selection,
}: {
  variants: readonly NormalizedVariant[];
  /** Localized column labels keyed by column key. */
  labels?: Partial<Record<string, string>>;
  /** Enables multi-size quotation selection on this table. */
  selection?: CatalogueSelectionContext;
}) {
  const columns = COLUMNS.filter(
    (column) =>
      column.key === "size" ||
      variants.some((variant) => column.value(variant) !== null),
  );

  const rows: CatalogueSizeRow[] = variants.map((variant, index) => {
    const cells: Record<string, string | null> = {};
    for (const column of columns) {
      cells[column.key] = column.value(variant);
    }
    return {
      id: `${variant.public.size}-${index}`,
      size: variant.public.size,
      cells,
      applications: variant.public.application ? [variant.public.application] : [],
    };
  });

  return (
    <CatalogueSizeTable
      columns={columns.map((column) => ({
        key: column.key,
        label: labels?.[column.key] ?? column.label,
        shortLabel: labels?.[column.key] ?? column.shortLabel,
      }))}
      rows={rows}
      selectionContext={selection}
      caption="Specification table of Variants for this Pattern"
      searchPlaceholder="Search sizes"
      emptyLabel="No size in this pattern matches that search."
    />
  );
}

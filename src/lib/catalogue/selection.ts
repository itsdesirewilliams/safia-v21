export type CatalogueSelectionKind = "tyre" | "tube" | "flap";

export type CatalogueSelectionContext = {
  kind: CatalogueSelectionKind;
  /** Stable category key used in storage keys and enquiry categories. */
  categoryKey: string;
  /** Customer-facing category label used in the quotation message. */
  categoryLabel: string;
  /** Pattern code or valve code. */
  productCode: string;
};

export type CatalogueSelectionItem = CatalogueSelectionContext & {
  key: string;
  size: string;
  applications: string[];
};

export function selectionKey(
  context: CatalogueSelectionContext,
  size: string,
): string {
  return `${context.kind}:${context.categoryKey}:${context.productCode}:${size}`;
}

export function createSelectionItem(
  context: CatalogueSelectionContext,
  size: string,
  applications: string[] = [],
): CatalogueSelectionItem {
  return {
    ...context,
    key: selectionKey(context, size),
    size,
    applications,
  };
}

export function selectionLabel(item: CatalogueSelectionItem): string {
  return `${item.productCode} — ${item.size}`;
}

export function buildQuotationMessage(
  items: readonly CatalogueSelectionItem[],
  maxLength = 3800,
): string {
  if (items.length === 0) {
    return "";
  }

  const groups = new Map<string, string[]>();
  for (const item of items) {
    const lines = groups.get(item.categoryLabel) ?? [];
    const application =
      item.applications.length > 0 ? ` (${item.applications.join(", ")})` : "";
    lines.push(`- ${selectionLabel(item)}${application}`);
    groups.set(item.categoryLabel, lines);
  }

  const lines = [
    "Hello Safeway Tyre,",
    "",
    "I would like a quotation for the following products:",
    "",
  ];

  for (const [category, entries] of groups) {
    lines.push(`${category}:`, ...entries, "");
  }

  const footer = "Please confirm availability and pricing.";
  lines.push(footer);

  let message = lines.join("\n");
  if (message.length <= maxLength) {
    return message;
  }

  const budget = Math.max(0, maxLength - footer.length - 20);
  const kept: string[] = [];
  let used = 0;
  for (const line of lines.slice(0, -1)) {
    if (used + line.length + 1 > budget) {
      break;
    }
    kept.push(line);
    used += line.length + 1;
  }
  kept.push("...");
  kept.push("", footer);
  message = kept.join("\n");
  return message.slice(0, maxLength);
}

export const CATALOGUE_SELECTION_STORAGE_KEY = "safeway-catalogue-selection-v1";
export const CATALOGUE_SELECTION_EVENT = "safeway-catalogue-selection-change";

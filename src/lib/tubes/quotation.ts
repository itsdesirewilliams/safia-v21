export type QuotationKind = "tube" | "flap";

export type QuotationItem = {
  key: string;
  kind: QuotationKind;
  size: string;
  valveCode?: string;
  valveId?: string;
  applications: string[];
};

export function tubeQuotationKey(valveId: string, size: string): string {
  return `tube:${valveId}:${size}`;
}

export function flapQuotationKey(size: string): string {
  return `flap:${size}`;
}

export function quotationItemLabel(item: QuotationItem): string {
  return item.kind === "tube" && item.valveCode
    ? `${item.valveCode} — ${item.size}`
    : `Flap — ${item.size}`;
}

export function buildQuotationMessage(
  items: readonly QuotationItem[],
  maxLength = 3800,
): string {
  if (items.length === 0) {
    return "";
  }

  const tubes = items.filter((item) => item.kind === "tube");
  const flaps = items.filter((item) => item.kind === "flap");
  const lines = [
    "Hello Safeway Tyre,",
    "",
    "I would like a quotation for the following Tubes & Flaps products:",
    "",
  ];

  if (tubes.length > 0) {
    lines.push("Tubes:");
    for (const item of tubes) {
      const application =
        item.applications.length > 0 ? ` (${item.applications.join(", ")})` : "";
      lines.push(`- ${quotationItemLabel(item)}${application}`);
    }
    lines.push("");
  }

  if (flaps.length > 0) {
    lines.push("Flaps:");
    for (const item of flaps) {
      lines.push(`- ${item.size}`);
    }
    lines.push("");
  }

  lines.push("Please confirm availability and pricing.");

  let message = lines.join("\n");
  if (message.length <= maxLength) {
    return message;
  }

  const footer = "\n\nPlease confirm availability and pricing.";
  const budget = Math.max(0, maxLength - footer.length - 12);
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
  message = kept.join("\n") + footer;
  return message.slice(0, maxLength);
}

/** Format a byte count for display (e.g. `1.4 MB`). Pure and testable. */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) {
    return "—";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unit]}`;
}

/** Format an ISO date string as `YYYY-MM-DD`, or `—` when unavailable. */
export function formatFileDate(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  return iso.slice(0, 10);
}

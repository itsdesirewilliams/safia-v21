"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import { sizeMatchesQuery } from "@/lib/tubes/catalogue";

export type SizeTableRow = {
  key: string;
  size: string;
  normalizedSize: string;
  looseSize: string;
  applications?: string[];
  sourceRowCount?: number;
};

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

export function SizeSelectionTable({
  rows,
  selected,
  onToggle,
  onSelectMany,
  applicationsLabel = "Application",
  searchPlaceholder = "Search sizes",
  emptyLabel = "No matching sizes.",
}: {
  rows: readonly SizeTableRow[];
  selected: ReadonlySet<string>;
  onToggle: (row: SizeTableRow) => void;
  onSelectMany: (rows: readonly SizeTableRow[], selected: boolean) => void;
  applicationsLabel?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      query.trim()
        ? rows.filter((row) => sizeMatchesQuery(row, query))
        : [...rows],
    [rows, query],
  );
  const visibleKeys = visible.map((row) => row.key);
  const allVisibleSelected =
    visibleKeys.length > 0 && visibleKeys.every((key) => selected.has(key));

  async function copy(row: SizeTableRow) {
    const copied = await copyToClipboard(row.size);
    if (!copied) {
      return;
    }
    setCopiedKey(row.key);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === row.key ? null : current));
    }, 1600);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">{searchPlaceholder}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15"
          />
        </label>
        <p className="text-xs text-ink-500" aria-live="polite">
          {visible.length} of {rows.length} sizes
        </p>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-ink-200">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead className="bg-ink-50 text-[11px] uppercase tracking-[0.12em] text-ink-500">
            <tr>
              <th scope="col" className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all visible sizes"
                  checked={allVisibleSelected}
                  onChange={(event) =>
                    onSelectMany(visible, event.target.checked && !allVisibleSelected)
                  }
                  className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-2 focus:ring-brand-500/40"
                />
              </th>
              <th scope="col" className="px-3 py-3 font-semibold">
                Size
              </th>
              <th scope="col" className="hidden px-3 py-3 font-semibold sm:table-cell">
                {applicationsLabel}
              </th>
              <th scope="col" className="w-20 px-3 py-3 text-right font-semibold">
                <span className="sr-only">Copy</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const isSelected = selected.has(row.key);
              return (
                <tr
                  key={row.key}
                  className={cn(
                    "border-t border-ink-200 align-top",
                    isSelected ? "bg-brand-100/40" : "even:bg-ink-50/40",
                  )}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.size}`}
                      checked={isSelected}
                      onChange={() => onToggle(row)}
                      className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-2 focus:ring-brand-500/40"
                    />
                  </td>
                  <td className="px-3 py-3 font-medium text-ink-900">
                    <span className="pattern-code-font break-words">{row.size}</span>
                    {(row.sourceRowCount ?? 1) > 1 && (
                      <span className="ml-2 rounded-full bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">
                        listed {row.sourceRowCount}×
                      </span>
                    )}
                    {row.applications && row.applications.length > 0 && (
                      <span className="mt-1 block text-[11px] font-normal leading-snug text-ink-500 sm:hidden">
                        {row.applications.join(", ")}
                      </span>
                    )}
                  </td>
                  <td className="hidden px-3 py-3 text-ink-600 sm:table-cell">
                    {row.applications?.join(", ") || "—"}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void copy(row)}
                      aria-label={`Copy ${row.size}`}
                      className="rounded-md border border-ink-200 px-2 py-1 text-[11px] font-semibold text-ink-600 transition-colors hover:border-ink-300 hover:bg-white hover:text-ink-950"
                    >
                      {copiedKey === row.key ? "Copied" : "Copy"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && (
        <p className="rounded-lg border border-dashed border-ink-200 bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}

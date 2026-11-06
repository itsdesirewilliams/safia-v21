"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import {
  createSelectionItem,
  type CatalogueSelectionContext,
} from "@/lib/catalogue/selection";
import { matchesSizeQuery } from "@/lib/catalogue/size-search";
import { useCatalogueSelection } from "@/hooks/use-catalogue-selection";

export type CatalogueSizeColumn = {
  key: string;
  label: string;
  shortLabel?: string;
};

export type CatalogueSizeRow = {
  id: string;
  size: string;
  cells: Record<string, string | null>;
  applications?: string[];
};

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the legacy path.
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

function CopySizeButton({ size }: { size: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (!(await copyToClipboard(size))) {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      aria-label={`Copy size ${size}`}
      title={`Copy ${size}`}
      className={cn(
        "ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded align-middle text-ink-400 transition-colors hover:bg-ink-100 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
        copied && "text-brand-700",
      )}
    >
      {copied ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-3.5 w-3.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 10 3 3 8-8" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-3.5 w-3.5"
        >
          <rect x="7" y="7" width="9" height="9" rx="1.5" />
          <path strokeLinecap="round" d="M13 7V5.5A1.5 1.5 0 0 0 11.5 4h-7A1.5 1.5 0 0 0 3 5.5v7A1.5 1.5 0 0 0 4.5 14H6" />
        </svg>
      )}
    </button>
  );
}

export function CatalogueSizeTable({
  columns,
  rows,
  selectionContext,
  caption = "Available sizes",
  searchPlaceholder = "Search sizes",
  emptyLabel = "No sizes match that search.",
}: {
  columns: readonly CatalogueSizeColumn[];
  rows: readonly CatalogueSizeRow[];
  selectionContext?: CatalogueSelectionContext;
  caption?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const { items, add, remove, toggle } = useCatalogueSelection();
  const selectedKeys = useMemo(() => new Set(items.map((item) => item.key)), [items]);
  const visible = useMemo(
    () => rows.filter((row) => matchesSizeQuery(row, query)),
    [rows, query],
  );
  const selectable = Boolean(selectionContext);
  const allVisibleSelected =
    selectable &&
    visible.length > 0 &&
    visible.every((row) =>
      selectedKeys.has(
        createSelectionItem(selectionContext!, row.size, row.applications ?? []).key,
      ),
    );

  function itemFor(row: CatalogueSizeRow) {
    return createSelectionItem(
      selectionContext!,
      row.size,
      row.applications ?? [],
    );
  }

  function toggleRow(row: CatalogueSizeRow) {
    if (!selectionContext) {
      return;
    }
    toggle(itemFor(row));
  }

  function selectMany(next: boolean) {
    if (!selectionContext) {
      return;
    }
    for (const row of visible) {
      const item = itemFor(row);
      if (next) {
        add(item);
      } else {
        remove(item.key);
      }
    }
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

      <div className="mt-3 rounded-card border border-ink-200">
        <table className="w-full table-fixed border-collapse text-left text-xs sm:text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-ink-50">
            <tr>
              {selectable && (
                <th scope="col" className="w-9 px-1.5 py-2.5 sm:px-3 sm:py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all visible sizes"
                    checked={allVisibleSelected}
                    onChange={(event) => selectMany(event.target.checked)}
                    className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-2 focus:ring-brand-500/40"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-2 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500 sm:px-4 sm:py-3 sm:text-xs sm:tracking-[0.14em]"
                >
                  <span className="sm:hidden">{column.shortLabel ?? column.label}</span>
                  <span className="hidden sm:inline">{column.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const item = selectionContext ? itemFor(row) : null;
              const isSelected = item ? selectedKeys.has(item.key) : false;
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-t border-ink-200 align-top",
                    isSelected ? "bg-brand-100/40" : "even:bg-ink-50/60",
                  )}
                >
                  {selectable && (
                    <td className="px-1.5 py-2.5 sm:px-3 sm:py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.size}`}
                        checked={isSelected}
                        onChange={() => toggleRow(row)}
                        className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-2 focus:ring-brand-500/40"
                      />
                    </td>
                  )}
                  {columns.map((column, index) => {
                    const value = row.cells[column.key] ?? null;
                    return (
                      <td
                        key={column.key}
                        className="break-words px-2 py-2.5 align-top text-ink-700 [overflow-wrap:anywhere] sm:px-4 sm:py-3"
                      >
                        {index === 0 ? (
                          <span className="inline-flex items-center gap-0.5">
                            <span className="pattern-code-font font-medium text-ink-900">
                              {row.size}
                            </span>
                            <CopySizeButton size={row.size} />
                          </span>
                        ) : (
                          value ?? "—"
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && (
        <p className="mt-3 rounded-card border border-dashed border-ink-200 bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}

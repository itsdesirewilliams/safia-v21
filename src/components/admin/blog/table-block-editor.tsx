"use client";

import { useId } from "react";

import { buttonStyles } from "@/components/ui/button";

/**
 * Editable table cells. The first row is the header row; rows and columns can
 * be appended or removed from the end. Pasting a table anywhere in the post
 * replaces the whole table (handled by the editor container).
 */
export function TableBlockEditor({
  rows,
  onChange,
}: {
  rows: string[][];
  onChange: (rows: string[][]) => void;
}) {
  const tableId = useId();
  const width = rows.reduce((max, row) => Math.max(max, row.length), 1);
  const normalised = rows.length > 0 ? rows : [[""]];
  const columnCount = Math.max(width, 1);

  function updateCell(rowIndex: number, columnIndex: number, value: string) {
    onChange(
      normalised.map((row, r) =>
        r === rowIndex
          ? Array.from({ length: columnCount }, (_, c) => (c === columnIndex ? value : (row[c] ?? "")))
          : Array.from({ length: columnCount }, (_, c) => row[c] ?? ""),
      ),
    );
  }

  function addRow() {
    onChange([
      ...normalised.map((row) => Array.from({ length: columnCount }, (_, c) => row[c] ?? "")),
      Array.from({ length: columnCount }, () => ""),
    ]);
  }

  function removeRow() {
    if (normalised.length <= 1) {
      return;
    }
    onChange(normalised.slice(0, -1).map((row) => row.slice(0, columnCount)));
  }

  function addColumn() {
    onChange(normalised.map((row) => [...Array.from({ length: columnCount }, (_, c) => row[c] ?? ""), ""]));
  }

  function removeColumn() {
    if (columnCount <= 1) {
      return;
    }
    onChange(normalised.map((row) => row.slice(0, columnCount - 1)));
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-ink-200">
        <table className="w-full min-w-[32rem] border-collapse text-sm">
          <thead className="bg-ink-50">
            <tr>
              {Array.from({ length: columnCount }, (_, column) => (
                <th key={column} scope="col" className="border-b border-ink-200 p-0">
                  <label className="sr-only" htmlFor={`${tableId}-header-${column}`}>
                    Header column {column + 1}
                  </label>
                  <input
                    id={`${tableId}-header-${column}`}
                    value={normalised[0]?.[column] ?? ""}
                    onChange={(event) => updateCell(0, column, event.target.value)}
                    className="w-full min-w-[9rem] bg-transparent px-3 py-2 font-semibold text-ink-950 outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-brand-500/40"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {normalised.slice(1).map((row, bodyIndex) => {
              const rowIndex = bodyIndex + 1;
              return (
                <tr key={rowIndex} className="even:bg-ink-50/50">
                  {Array.from({ length: columnCount }, (_, column) => (
                    <td key={column} className="border-b border-ink-100 p-0">
                      <label className="sr-only" htmlFor={`${tableId}-cell-${rowIndex}-${column}`}>
                        Row {rowIndex + 1}, column {column + 1}
                      </label>
                      <input
                        id={`${tableId}-cell-${rowIndex}-${column}`}
                        value={row[column] ?? ""}
                        onChange={(event) => updateCell(rowIndex, column, event.target.value)}
                        className="w-full min-w-[9rem] bg-transparent px-3 py-2 text-ink-800 outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-brand-500/40"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={addRow} className={buttonStyles("outline", "sm")}>
          + Row
        </button>
        <button type="button" onClick={removeRow} className={buttonStyles("outline", "sm")}>
          Remove row
        </button>
        <button type="button" onClick={addColumn} className={buttonStyles("outline", "sm")}>
          + Column
        </button>
        <button type="button" onClick={removeColumn} className={buttonStyles("outline", "sm")}>
          Remove column
        </button>
      </div>
      <p className="text-xs text-ink-500">
        Paste a table from Excel, Google Sheets, Word or a web page into the editor to replace it.
      </p>
    </div>
  );
}

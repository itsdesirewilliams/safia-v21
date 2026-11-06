"use client";

import { useMemo, useState } from "react";

import { QueryForm } from "@/components/contact/query-form";
import { buttonStyles } from "@/components/ui/button";
import { useCatalogueSelection } from "@/hooks/use-catalogue-selection";
import { isCategorySlug } from "@/lib/catalogue/categories";
import {
  buildQuotationMessage,
  selectionLabel,
} from "@/lib/catalogue/selection";

import { OverlayPanel } from "./overlay-panel";

export function CatalogueSelectionBar() {
  const { items, hydrated, remove, clear } = useCatalogueSelection();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const quotationMessage = useMemo(
    () => buildQuotationMessage(items),
    [items],
  );
  const categories = useMemo(
    () =>
      [...new Set(items.map((item) => item.categoryKey))].filter(
        (key) => isCategorySlug(key),
      ),
    [items],
  );

  if (!hydrated || items.length === 0) {
    return null;
  }

  return (
    <>
      <div aria-hidden="true" className="h-20" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 p-3 shadow-[0_-12px_32px_-20px_rgba(7,16,24,0.4)] backdrop-blur sm:inset-x-auto sm:bottom-6 sm:right-6 sm:rounded-full sm:border sm:p-1.5">
        <button
          type="button"
          onClick={() => setSummaryOpen(true)}
          className="flex w-full items-center justify-between gap-4 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:w-auto"
        >
          <span>Selected Products ({items.length})</span>
          <span aria-hidden="true">View →</span>
        </button>
      </div>

      <OverlayPanel
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        labelledBy="catalogue-selection-title"
        title={`Selected Products (${items.length})`}
      >
        <div className="flex min-h-full flex-col">
          <div className="flex-1 space-y-3 px-5 py-5 sm:px-6">
            <p className="text-sm leading-relaxed text-ink-600">
              Review the sizes you want Safeway Tyre to quote. You can remove any item
              before opening the shared enquiry form.
            </p>
            <ul className="divide-y divide-ink-100 rounded-card border border-ink-200">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex items-start justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="pattern-code-font text-sm font-semibold text-ink-950">
                      {selectionLabel(item)}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {item.categoryLabel}
                      {item.applications.length > 0
                        ? ` · ${item.applications.join(", ")}`
                        : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.key)}
                    aria-label={`Remove ${selectionLabel(item)}`}
                    className="shrink-0 text-xs font-semibold text-brand-700 underline-offset-2 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="sticky bottom-0 border-t border-ink-200 bg-white px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={clear}
                className="text-sm font-semibold text-ink-600 underline-offset-2 hover:underline"
              >
                Clear selection
              </button>
              <button
                type="button"
                onClick={() => {
                  setSummaryOpen(false);
                  setQuoteOpen(true);
                }}
                className={buttonStyles("primary", "md")}
              >
                Request quotation
              </button>
            </div>
          </div>
        </div>
      </OverlayPanel>

      <OverlayPanel
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        labelledBy="catalogue-quote-title"
        title="Request a quotation"
        placement="centre"
      >
        <div className="px-5 py-5 sm:px-6">
          <p className="mb-5 rounded-lg border border-brand-100 bg-brand-100/40 px-4 py-3 text-sm leading-relaxed text-ink-700">
            Your selected products are already included in the message below. You can
            edit it before sending. Nothing is submitted until you press Send Inquiry.
          </p>
          <QueryForm
            idPrefix="catalogue-quote"
            initialCategories={categories}
            initialMessage={quotationMessage}
          />
        </div>
      </OverlayPanel>
    </>
  );
}

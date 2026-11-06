"use client";

import { useMemo, useState } from "react";

import { QueryForm } from "@/components/contact/query-form";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  FLAP_IMAGE,
  TUBES_STATS,
  TUBE_APPLICATIONS,
  applicationNames,
  getValve,
  listFlapSizes,
  listValveSizes,
  listValvesForApplication,
  searchFlapSizes,
  searchTubeSizes,
  type FlapVariant,
  type TubeSizeMatch,
  type TubeValve,
} from "@/lib/tubes/catalogue";
import {
  buildQuotationMessage,
  flapQuotationKey,
  quotationItemLabel,
  tubeQuotationKey,
  type QuotationItem,
} from "@/lib/tubes/quotation";

import { OverlayPanel } from "./overlay-panel";
import { SizeSelectionTable, type SizeTableRow } from "./size-table";

type TabValue = string | "flaps";

function valveImage(valve: TubeValve) {
  if (valve.imagePath) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element -- local catalogue artwork */
      <img
        src={valve.imagePath}
        alt={`${valve.code} valve`}
        loading="lazy"
        className="h-full w-full object-contain p-2"
      />
    );
  }
  return (
    <span className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-[11px] leading-tight text-ink-400">
      <span className="text-lg text-ink-300">◌</span>
      Image pending
    </span>
  );
}

function ApplicationBadges({
  slugs,
  max = 3,
}: {
  slugs: readonly string[];
  max?: number;
}) {
  const names = applicationNames(slugs);
  const shown = names.slice(0, max);
  const remaining = names.length - shown.length;
  return (
    <span className="flex flex-wrap gap-1">
      {shown.map((name) => (
        <span
          key={name}
          className="rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-[10px] font-medium text-ink-600"
        >
          {name}
        </span>
      ))}
      {remaining > 0 && (
        <span className="rounded-full border border-ink-200 bg-white px-2 py-0.5 text-[10px] font-medium text-ink-500">
          +{remaining}
        </span>
      )}
    </span>
  );
}

function ValveCard({
  valve,
  sizeCount,
  onOpen,
}: {
  valve: TubeValve;
  sizeCount: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col rounded-card border border-ink-200 bg-white p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 motion-reduce:hover:translate-y-0"
    >
      <span className="flex items-start gap-4">
        <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-100 bg-ink-50 sm:h-28 sm:w-28">
          {valveImage(valve)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="pattern-code-font block text-xl font-semibold tracking-tight text-ink-950">
            {valve.code}
          </span>
          <span className="mt-1 block text-sm text-ink-600">
            {sizeCount} available {sizeCount === 1 ? "size" : "sizes"}
          </span>
          <span className="mt-3 block">
            <ApplicationBadges slugs={valve.applications} />
          </span>
          {valve.imageStatus === "missing" && (
            <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
              Image pending
            </span>
          )}
        </span>
      </span>
      <span className="mt-5 inline-flex items-center justify-between gap-2 border-t border-ink-100 pt-4 text-sm font-semibold text-brand-700">
        View sizes
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition-colors group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
          →
        </span>
      </span>
    </button>
  );
}

function valveMatchesToItems(matches: readonly TubeSizeMatch[]): QuotationItem[] {
  return matches.map((match) => ({
    key: tubeQuotationKey(match.valveId, match.originalSize),
    kind: "tube",
    size: match.originalSize,
    valveCode: match.valveCode,
    valveId: match.valveId,
    applications: match.applications.map((application) => application.name),
  }));
}

function flapToItem(flap: FlapVariant): QuotationItem {
  return {
    key: flapQuotationKey(flap.originalSize),
    kind: "flap",
    size: flap.originalSize,
    applications: [],
  };
}

function SearchResults({
  query,
  tubeMatches,
  flapMatches,
  selected,
  onToggle,
  onOpenValve,
}: {
  query: string;
  tubeMatches: readonly TubeSizeMatch[];
  flapMatches: readonly FlapVariant[];
  selected: ReadonlySet<string>;
  onToggle: (item: QuotationItem) => void;
  onOpenValve: (valveId: string) => void;
}) {
  const total = tubeMatches.length + flapMatches.length;
  return (
    <div className="mt-8" aria-live="polite">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink-950">
            Size matches for “{query.trim()}”
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            {total === 0
              ? "No matching tube or flap sizes were found."
              : `${total} matching ${total === 1 ? "record" : "records"} across every application.`}
          </p>
        </div>
      </div>

      {total > 0 && (
        <div className="mt-5 overflow-hidden rounded-card border border-ink-200 bg-white">
          {tubeMatches.map((match) => {
            const item = valveMatchesToItems([match])[0];
            const isSelected = selected.has(item.key);
            return (
              <div
                key={item.key}
                className="flex flex-col gap-3 border-b border-ink-100 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="min-w-0">
                  <p className="pattern-code-font text-base font-semibold text-ink-950">
                    {match.originalSize}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-600">
                    Valve {match.valveCode}
                    {match.applications.length > 0
                      ? ` · ${match.applications.map((app) => app.name).join(", ")}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenValve(match.valveId)}
                    className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
                  >
                    Open {match.valveCode}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggle(item)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                      isSelected
                        ? "bg-brand-600 text-white hover:bg-brand-700"
                        : "border border-brand-200 bg-brand-100/50 text-brand-700 hover:bg-brand-100",
                    )}
                  >
                    {isSelected ? "Selected" : "Add size"}
                  </button>
                </div>
              </div>
            );
          })}

          {flapMatches.map((flap) => {
            const item = flapToItem(flap);
            const isSelected = selected.has(item.key);
            return (
              <div
                key={item.key}
                className="flex flex-col gap-3 border-b border-ink-100 bg-ink-50/50 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div>
                  <p className="pattern-code-font text-base font-semibold text-ink-950">
                    {flap.originalSize}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-600">Flap · no valve type</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(item)}
                  className={cn(
                    "self-start rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:self-auto",
                    isSelected
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "border border-brand-200 bg-brand-100/50 text-brand-700 hover:bg-brand-100",
                  )}
                >
                  {isSelected ? "Selected" : "Add flap size"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ValvePanel({
  valve,
  selected,
  onToggle,
  onClose,
  labelId,
}: {
  valve: TubeValve;
  selected: ReadonlySet<string>;
  onToggle: (row: SizeTableRow) => void;
  onClose: () => void;
  labelId: string;
}) {
  const rows = useMemo<SizeTableRow[]>(
    () =>
      listValveSizes(valve.id).map((size) => ({
        key: tubeQuotationKey(valve.id, size.originalSize),
        size: size.originalSize,
        normalizedSize: size.normalizedSize,
        looseSize: size.looseSize,
        applications: applicationNames(size.applicationSlugs),
        sourceRowCount: size.sourceRowCount,
      })),
    [valve.id],
  );

  return (
    <OverlayPanel
      open
      onClose={onClose}
      labelledBy={labelId}
      title={`${valve.code} — Available sizes`}
    >
      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-4 rounded-card border border-ink-200 bg-ink-50 p-4">
          <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-white">
            {valveImage(valve)}
          </span>
          <div className="min-w-0">
            <p className="pattern-code-font text-xl font-semibold text-ink-950">
              {valve.code}
            </p>
            <p className="mt-1 text-sm text-ink-600">
              {rows.length} verified {rows.length === 1 ? "size" : "sizes"} in the catalogue.
            </p>
            <div className="mt-2">
              <ApplicationBadges slugs={valve.applications} max={5} />
            </div>
            {valve.sourceTexts.length > 0 && (
              <p className="mt-2 text-[11px] leading-snug text-ink-400">
                Source valve text: {valve.sourceTexts[0]}
              </p>
            )}
          </div>
        </div>

        <SizeSelectionTable
          rows={rows}
          selected={selected}
          onToggle={onToggle}
          onSelectMany={(visibleRows, next) => {
            for (const row of visibleRows) {
              if (selected.has(row.key) !== next) {
                onToggle(row);
              }
            }
          }}
          searchPlaceholder="Search sizes for this valve"
          emptyLabel="No size in this valve matches that search."
        />

        <p className="text-xs leading-relaxed text-ink-500">
          Sizes are shown exactly as published in the Safeway catalogue. Selecting a size
          adds it to your quotation list; it does not confirm stock.
        </p>
      </div>
    </OverlayPanel>
  );
}

function FlapPanel({
  flaps,
  selected,
  onToggle,
  onSelectMany,
}: {
  flaps: readonly FlapVariant[];
  selected: ReadonlySet<string>;
  onToggle: (row: SizeTableRow) => void;
  onSelectMany: (rows: readonly SizeTableRow[], selected: boolean) => void;
}) {
  const rows = useMemo<SizeTableRow[]>(
    () =>
      flaps.map((flap) => ({
        key: flapQuotationKey(flap.originalSize),
        size: flap.originalSize,
        normalizedSize: flap.normalizedSize,
        looseSize: flap.looseSize,
      })),
    [flaps],
  );

  return (
    <section aria-labelledby="flaps-heading" className="mt-8">
      <div className="grid gap-6 rounded-card border border-ink-200 bg-ink-50 p-6 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-center sm:p-8">
        <div>
          <p className="text-eyebrow text-brand-600">Separate product family</p>
          <h2
            id="flaps-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-ink-950"
          >
            Flaps
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
            Flaps are size-based rim protectors and do not carry valve types. Search,
            copy or select any flap size for a quotation enquiry.
          </p>
        </div>
        <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-white p-3 sm:h-32">
          {/* eslint-disable-next-line @next/next/no-img-element -- local catalogue artwork */}
          <img
            src={FLAP_IMAGE}
            alt="Safeway Tyre tube flap"
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <div className="mt-6">
        <SizeSelectionTable
          rows={rows}
          selected={selected}
          onToggle={onToggle}
          onSelectMany={onSelectMany}
          applicationsLabel="Product"
          searchPlaceholder="Search flap sizes"
          emptyLabel="No flap size matches that search."
        />
      </div>
    </section>
  );
}

function SelectionSummary({
  items,
  onRemove,
  onClear,
  onRequestQuote,
}: {
  items: readonly QuotationItem[];
  onRemove: (key: string) => void;
  onClear: () => void;
  onRequestQuote: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 space-y-3 px-5 py-5 sm:px-6">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ink-200 bg-ink-50 px-4 py-8 text-center text-sm text-ink-500">
            No products selected yet.
          </p>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-ink-600">
              Review the sizes you want Safeway Tyre to quote. You can remove any item
              before opening the enquiry form.
            </p>
            <ul className="divide-y divide-ink-100 rounded-card border border-ink-200">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex items-start justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="pattern-code-font text-sm font-semibold text-ink-950">
                      {quotationItemLabel(item)}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {item.kind === "flap"
                        ? "Flap"
                        : item.applications.join(", ") || "Tube"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.key)}
                    aria-label={`Remove ${quotationItemLabel(item)}`}
                    className="shrink-0 text-xs font-semibold text-brand-700 underline-offset-2 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="sticky bottom-0 border-t border-ink-200 bg-white px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClear}
            disabled={items.length === 0}
            className="text-sm font-semibold text-ink-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear selection
          </button>
          <button
            type="button"
            onClick={onRequestQuote}
            disabled={items.length === 0}
            className={buttonStyles(
              "primary",
              "md",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            Request quotation
          </button>
        </div>
      </div>
    </div>
  );
}

export function TubesCatalogue() {
  const [activeTab, setActiveTab] = useState<TabValue>(
    TUBE_APPLICATIONS[0]?.slug ?? "flaps",
  );
  const [query, setQuery] = useState("");
  const [openValveId, setOpenValveId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<QuotationItem[]>([]);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const selected = useMemo(
    () => new Set(selectedItems.map((item) => item.key)),
    [selectedItems],
  );

  const tubeMatches = useMemo(
    () => (query.trim() ? searchTubeSizes(query) : []),
    [query],
  );
  const flapMatches = useMemo(
    () => (query.trim() ? searchFlapSizes(query) : []),
    [query],
  );

  const activeApplication = useMemo(
    () =>
      TUBE_APPLICATIONS.find((application) => application.slug === activeTab) ??
      null,
    [activeTab],
  );

  const applicationValves = useMemo(
    () =>
      activeApplication
        ? listValvesForApplication(activeApplication.slug)
        : [],
    [activeApplication],
  );

  const flaps = useMemo(() => listFlapSizes(), []);
  const valve = openValveId ? getValve(openValveId) : undefined;

  function toggleItem(item: QuotationItem) {
    setSelectedItems((current) =>
      current.some((entry) => entry.key === item.key)
        ? current.filter((entry) => entry.key !== item.key)
        : [...current, item],
    );
  }

  function toggleRow(row: SizeTableRow, item: QuotationItem) {
    if (!selected.has(item.key)) {
      setSelectedItems((current) =>
        current.some((entry) => entry.key === item.key)
          ? current
          : [...current, item],
      );
      return;
    }
    setSelectedItems((current) => current.filter((entry) => entry.key !== row.key));
  }

  function toggleFlapRow(row: SizeTableRow) {
    toggleItem({
      key: row.key,
      kind: "flap",
      size: row.size,
      applications: [],
    });
  }

  function selectMany(rows: readonly SizeTableRow[], next: boolean, kind: "tube" | "flap") {
    setSelectedItems((current) => {
      const keys = new Set(rows.map((row) => row.key));
      const without = current.filter((entry) => !keys.has(entry.key));
      if (!next) {
        return without;
      }
      const additions: QuotationItem[] = rows.map((row) =>
        kind === "tube"
          ? {
              key: row.key,
              kind: "tube",
              size: row.size,
              valveCode: valve?.code,
              valveId: valve?.id,
              applications: row.applications ?? [],
            }
          : {
              key: row.key,
              kind: "flap",
              size: row.size,
              applications: [],
            },
      );
      const existing = new Set(current.map((entry) => entry.key));
      return [...current, ...additions.filter((entry) => !existing.has(entry.key))];
    });
  }

  const quotationMessage = useMemo(
    () => buildQuotationMessage(selectedItems),
    [selectedItems],
  );

  return (
    <div className={cn("bg-white", selectedItems.length > 0 && "pb-24")}>
      <section className="border-b border-ink-200 bg-ink-50/60 py-10 lg:py-14">
        <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <p className="text-eyebrow text-brand-600">Tubes & Flaps catalogue</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
                Find a tube by size
              </h2>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-600">
                Search across every application and valve type. If you already know your
                application, browse the valve products below.
              </p>
              <label className="mt-5 block max-w-2xl">
                <span className="sr-only">Find a tube by size</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find a tube by size — e.g. 12.00-20, 7.50-16 or 4.00-8"
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3.5 text-base text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15"
                />
              </label>
              <p className="mt-2 text-xs text-ink-500">
                Formatting variations are matched, but the catalogue display keeps the
                original size notation.
              </p>
            </div>

            <dl className="grid grid-cols-3 gap-3 rounded-card border border-ink-200 bg-white p-4">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  Applications
                </dt>
                <dd className="mt-1 text-2xl font-bold text-ink-950">
                  {TUBES_STATS.applications}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  Valves
                </dt>
                <dd className="mt-1 text-2xl font-bold text-ink-950">
                  {TUBES_STATS.valves}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  Flap sizes
                </dt>
                <dd className="mt-1 text-2xl font-bold text-ink-950">
                  {TUBES_STATS.flapSizes}
                </dd>
              </div>
            </dl>
          </div>

          {query.trim() && (
            <SearchResults
              query={query}
              tubeMatches={tubeMatches}
              flapMatches={flapMatches}
              selected={selected}
              onToggle={toggleItem}
              onOpenValve={setOpenValveId}
            />
          )}
        </div>
      </section>

      {!query.trim() && (
        <section className="py-10 lg:py-14">
          <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
            <div
              role="tablist"
              aria-label="Tube applications"
              className="flex gap-2 overflow-x-auto pb-2"
            >
              {TUBE_APPLICATIONS.map((application) => {
                const active = application.slug === activeTab;
                return (
                  <button
                    key={application.slug}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(application.slug)}
                    className={cn(
                      "shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors",
                      active
                        ? "border-brand-600 bg-brand-600 text-white shadow-soft"
                        : "border-ink-200 bg-white text-ink-700 hover:border-brand-200 hover:bg-brand-100/40 hover:text-brand-700",
                    )}
                  >
                    {application.shortName}
                  </button>
                );
              })}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "flaps"}
                onClick={() => setActiveTab("flaps")}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors",
                  activeTab === "flaps"
                    ? "border-brand-600 bg-brand-600 text-white shadow-soft"
                    : "border-ink-200 bg-white text-ink-700 hover:border-brand-200 hover:bg-brand-100/40 hover:text-brand-700",
                )}
              >
                Flaps
              </button>
            </div>

            <div className="mt-7">
              {activeTab === "flaps" ? (
                <FlapPanel
                  flaps={flaps}
                  selected={selected}
                  onToggle={toggleFlapRow}
                  onSelectMany={(rows, next) => selectMany(rows, next, "flap")}
                />
              ) : activeApplication ? (
                <div>
                  <div className="max-w-3xl">
                    <p className="text-eyebrow text-brand-600">Application</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
                      {activeApplication.name}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">
                      {activeApplication.description}
                    </p>
                  </div>

                  {applicationValves.length === 0 ? (
                    <p className="mt-8 rounded-card border border-dashed border-ink-200 bg-ink-50 p-8 text-sm text-ink-500">
                      No valve products are published for this application yet.
                    </p>
                  ) : (
                    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {applicationValves.map(({ valve: item, sizeCount }) => (
                        <li key={item.id} className="h-full">
                          <ValveCard
                            valve={item}
                            sizeCount={sizeCount}
                            onOpen={() => setOpenValveId(item.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {valve && (
        <ValvePanel
          key={valve.id}
          valve={valve}
          selected={selected}
          onToggle={(row) =>
            toggleRow(row, {
              key: row.key,
              kind: "tube",
              size: row.size,
              valveCode: valve.code,
              valveId: valve.id,
              applications: row.applications ?? [],
            })
          }
          onClose={() => setOpenValveId(null)}
          labelId="valve-panel-title"
        />
      )}

      <OverlayPanel
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        labelledBy="selection-summary-title"
        title={`Selected Products (${selectedItems.length})`}
      >
        <SelectionSummary
          items={selectedItems}
          onRemove={(key) =>
            setSelectedItems((current) => current.filter((item) => item.key !== key))
          }
          onClear={() => setSelectedItems([])}
          onRequestQuote={() => {
            setSummaryOpen(false);
            setQuoteOpen(true);
          }}
        />
      </OverlayPanel>

      <OverlayPanel
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        labelledBy="tubes-quote-title"
        title="Request a quotation"
        placement="centre"
      >
        <div className="px-5 py-5 sm:px-6">
          <p className="mb-5 rounded-lg border border-brand-100 bg-brand-100/40 px-4 py-3 text-sm leading-relaxed text-ink-700">
            Your selected products are already included in the message below. You can
            edit it before sending. Nothing is submitted until you press Send Inquiry.
          </p>
          <QueryForm
            idPrefix="tubes-quote"
            initialCategories={["tubes"]}
            initialMessage={quotationMessage}
          />
        </div>
      </OverlayPanel>

      {selectedItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 p-3 shadow-[0_-12px_32px_-20px_rgba(7,16,24,0.4)] backdrop-blur sm:inset-x-auto sm:bottom-6 sm:right-6 sm:rounded-full sm:border sm:p-1.5">
          <button
            type="button"
            onClick={() => setSummaryOpen(true)}
            className="flex w-full items-center justify-between gap-4 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:w-auto"
          >
            <span>Selected Products ({selectedItems.length})</span>
            <span aria-hidden="true">View →</span>
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CatalogueCard } from "@/components/catalogue/catalogue-card";
import { CatalogueSizeTable } from "@/components/catalogue/catalogue-size-table";
import { PatternImage } from "@/components/catalogue/pattern-image";
import { useCatalogueSelection } from "@/hooks/use-catalogue-selection";
import { cn } from "@/lib/cn";
import { createSelectionItem } from "@/lib/catalogue/selection";
import {
  FLAP_IMAGE,
  TUBES_STATS,
  TUBE_APPLICATIONS,
  applicationNames,
  listFlapSizes,
  listValvesForApplication,
  searchFlapSizes,
  searchTubeSizes,
  type FlapVariant,
  type TubeSizeMatch,
  type TubeValve,
} from "@/lib/tubes/catalogue";
import { ROUTES } from "@/lib/routes";

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
}: {
  valve: TubeValve;
  sizeCount: number;
}) {
  return (
    <CatalogueCard
      href={ROUTES.tubeValve(valve.id)}
      title={valve.code}
      image={
        <PatternImage
          src={valve.imagePath}
          alt={`${valve.code} valve`}
          fallbackLabel="Valve image pending"
          className="h-full w-full"
        />
      }
      meta={`${sizeCount} available ${sizeCount === 1 ? "size" : "sizes"}`}
      badges={<ApplicationBadges slugs={valve.applications} />}
    />
  );
}

function tubeSearchItem(match: TubeSizeMatch) {
  return createSelectionItem(
    {
      kind: "tube",
      categoryKey: "tubes",
      categoryLabel: "Tubes & Flaps",
      productCode: match.valveCode,
    },
    match.originalSize,
    match.applications.map((application) => application.name),
  );
}

function flapSelectionItem(flap: FlapVariant) {
  return createSelectionItem(
    {
      kind: "flap",
      categoryKey: "tubes",
      categoryLabel: "Flaps",
      productCode: "Flaps",
    },
    flap.originalSize,
  );
}

function SearchResults({
  query,
  tubeMatches,
  flapMatches,
}: {
  query: string;
  tubeMatches: readonly TubeSizeMatch[];
  flapMatches: readonly FlapVariant[];
}) {
  const { items, toggle } = useCatalogueSelection();
  const selectedKeys = useMemo(() => new Set(items.map((item) => item.key)), [items]);
  const total = tubeMatches.length + flapMatches.length;

  return (
    <div className="mt-8" aria-live="polite">
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

      {total > 0 && (
        <div className="mt-5 overflow-hidden rounded-card border border-ink-200 bg-white">
          {tubeMatches.map((match) => {
            const item = tubeSearchItem(match);
            const isSelected = selectedKeys.has(item.key);
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
                  <Link
                    href={ROUTES.tubeValve(match.valveId)}
                    className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
                  >
                    Open {match.valveCode}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggle(item)}
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
            const item = flapSelectionItem(flap);
            const isSelected = selectedKeys.has(item.key);
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
                  onClick={() => toggle(item)}
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

function FlapPanel({ flaps }: { flaps: readonly FlapVariant[] }) {
  const rows = useMemo(
    () =>
      flaps.map((flap) => ({
        id: flap.id,
        size: flap.originalSize,
        cells: { size: flap.originalSize },
        applications: [],
      })),
    [flaps],
  );
  const context = useMemo(
    () => ({
      kind: "flap" as const,
      categoryKey: "tubes",
      categoryLabel: "Flaps",
      productCode: "Flaps",
    }),
    [],
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
        <CatalogueSizeTable
          columns={[{ key: "size", label: "Size", shortLabel: "Size" }]}
          rows={rows}
          selectionContext={context}
          caption="Available flap sizes"
          searchPlaceholder="Search flap sizes"
          emptyLabel="No flap size matches that search."
        />
      </div>
    </section>
  );
}

export function TubesCatalogue() {
  const [activeTab, setActiveTab] = useState<string>(
    TUBE_APPLICATIONS[0]?.slug ?? "flaps",
  );
  const [query, setQuery] = useState("");

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

  return (
    <div className="bg-white">
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
                <FlapPanel flaps={flaps} />
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
                          <ValveCard valve={item} sizeCount={sizeCount} />
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
    </div>
  );
}

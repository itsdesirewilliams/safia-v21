import raw from "./data.json";

import { normalizeTyreSize } from "@/lib/search/tyre-size";

export type TubeApplication = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  order: number;
};

export type TubeValve = {
  id: string;
  code: string;
  aliases: string[];
  sourceTexts: string[];
  applications: string[];
  imagePath: string | null;
  imageStatus: "available" | "missing";
};

export type TubeVariant = {
  id: string;
  applicationSlug: string;
  valveId: string;
  valveCode: string;
  originalSize: string;
  sourceValveText: string;
  sourceTable: string;
  sourceRow: number;
  verification: "verified" | "needs_review" | "unreadable";
  normalizedSize: string;
  looseSize: string;
};

export type FlapVariant = {
  id: string;
  originalSize: string;
  sourceTable: string;
  sourceRow: number;
  verification: "verified" | "needs_review" | "unreadable";
  normalizedSize: string;
  looseSize: string;
};

export type ValveSize = {
  valveId: string;
  valveCode: string;
  originalSize: string;
  normalizedSize: string;
  looseSize: string;
  applicationSlugs: string[];
  sourceRowCount: number;
};

export type TubeSizeMatch = ValveSize & {
  valve: TubeValve;
  applications: TubeApplication[];
};

export type FlapSizeMatch = FlapVariant;

type RawData = {
  applications: TubeApplication[];
  valves: TubeValve[];
  applicationValves: { applicationSlug: string; valveId: string; order: number }[];
  tubeVariants: Omit<TubeVariant, "normalizedSize" | "looseSize">[];
  flaps: Omit<FlapVariant, "normalizedSize" | "looseSize">[];
};

const data = raw as RawData;

export const TUBE_APPLICATIONS: readonly TubeApplication[] = [...data.applications].sort(
  (a, b) => a.order - b.order,
);

export const TUBE_VALVES: readonly TubeValve[] = data.valves;

export const FLAP_IMAGE = "/assets/tubes/flaps.webp";

const APPLICATION_BY_SLUG = new Map(
  TUBE_APPLICATIONS.map((application) => [application.slug, application]),
);

const VALVE_BY_ID = new Map(TUBE_VALVES.map((valve) => [valve.id, valve]));

function looseSizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[×✕]/g, "x")
    .replace(/[^a-z0-9]/g, "");
}

function buildSize(value: string): { normalizedSize: string; looseSize: string } {
  const looseSize = looseSizeKey(value);
  const canonical = normalizeTyreSize(value);
  return {
    normalizedSize: canonical ?? looseSize,
    looseSize,
  };
}

const TUBE_VARIANTS: readonly TubeVariant[] = data.tubeVariants.map((variant) => ({
  ...variant,
  ...buildSize(variant.originalSize),
}));

const FLAP_VARIANTS: readonly FlapVariant[] = data.flaps.map((variant) => ({
  ...variant,
  ...buildSize(variant.originalSize),
}));

const APPLICATION_VALVES = [...data.applicationValves].sort(
  (a, b) => a.order - b.order,
);

export function getApplication(slug: string): TubeApplication | undefined {
  return APPLICATION_BY_SLUG.get(slug);
}

export function getValve(id: string): TubeValve | undefined {
  return VALVE_BY_ID.get(id);
}

export function getValveByCode(code: string): TubeValve | undefined {
  return TUBE_VALVES.find(
    (valve) =>
      valve.code.toLowerCase() === code.toLowerCase() ||
      valve.aliases.some((alias) => alias.toLowerCase() === code.toLowerCase()),
  );
}

export function listValvesForApplication(applicationSlug: string): {
  valve: TubeValve;
  sizeCount: number;
}[] {
  return APPLICATION_VALVES.filter(
    (entry) => entry.applicationSlug === applicationSlug,
  )
    .map((entry) => {
      const valve = VALVE_BY_ID.get(entry.valveId);
      if (!valve) {
        return null;
      }
      const sizes = new Set(
        TUBE_VARIANTS.filter(
          (variant) =>
            variant.valveId === valve.id &&
            variant.applicationSlug === applicationSlug,
        ).map((variant) => variant.originalSize),
      );
      return { valve, sizeCount: sizes.size };
    })
    .filter((entry): entry is { valve: TubeValve; sizeCount: number } => Boolean(entry));
}

export function listAllValves(): TubeValve[] {
  return [...TUBE_VALVES].sort((a, b) => a.code.localeCompare(b.code));
}

export function listValveSizes(valveId: string): ValveSize[] {
  const grouped = new Map<string, ValveSize>();
  for (const variant of TUBE_VARIANTS) {
    if (variant.valveId !== valveId) {
      continue;
    }
    const existing = grouped.get(variant.originalSize);
    if (existing) {
      existing.sourceRowCount += 1;
      if (!existing.applicationSlugs.includes(variant.applicationSlug)) {
        existing.applicationSlugs.push(variant.applicationSlug);
      }
      continue;
    }
    grouped.set(variant.originalSize, {
      valveId: variant.valveId,
      valveCode: variant.valveCode,
      originalSize: variant.originalSize,
      normalizedSize: variant.normalizedSize,
      looseSize: variant.looseSize,
      applicationSlugs: [variant.applicationSlug],
      sourceRowCount: 1,
    });
  }
  return [...grouped.values()];
}

export function listValveSizesForApplication(
  valveId: string,
  applicationSlug: string,
): ValveSize[] {
  return listValveSizes(valveId).filter((size) =>
    size.applicationSlugs.includes(applicationSlug),
  );
}

export function listFlapSizes(): FlapVariant[] {
  return [...FLAP_VARIANTS];
}

export function sizeMatchesQuery(
  value: { normalizedSize: string; looseSize: string },
  query: string,
): boolean {
  const trimmed = query.trim();
  if (!trimmed) {
    return false;
  }
  const canonical = normalizeTyreSize(trimmed);
  const loose = looseSizeKey(trimmed);
  if (!canonical && loose.length < 2) {
    return false;
  }
  if (canonical && value.normalizedSize === canonical) {
    return true;
  }
  if (loose && value.looseSize === loose) {
    return true;
  }
  if (canonical && canonical.length >= 2 && value.normalizedSize.includes(canonical)) {
    return true;
  }
  return loose.length >= 2 && value.looseSize.includes(loose);
}

export function searchTubeSizes(query: string): TubeSizeMatch[] {
  const grouped = new Map<string, TubeSizeMatch>();
  for (const variant of TUBE_VARIANTS) {
    if (!sizeMatchesQuery(variant, query)) {
      continue;
    }
    const valve = VALVE_BY_ID.get(variant.valveId);
    if (!valve) {
      continue;
    }
    const key = `${variant.valveId}|${variant.originalSize}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.sourceRowCount += 1;
      if (!existing.applicationSlugs.includes(variant.applicationSlug)) {
        existing.applicationSlugs.push(variant.applicationSlug);
      }
      continue;
    }
    grouped.set(key, {
      valveId: variant.valveId,
      valveCode: variant.valveCode,
      originalSize: variant.originalSize,
      normalizedSize: variant.normalizedSize,
      looseSize: variant.looseSize,
      applicationSlugs: [variant.applicationSlug],
      sourceRowCount: 1,
      valve,
      applications: [],
    });
  }

  return [...grouped.values()]
    .map((match) => ({
      ...match,
      applications: match.applicationSlugs
        .map((slug) => APPLICATION_BY_SLUG.get(slug))
        .filter((application): application is TubeApplication => Boolean(application)),
    }))
    .sort(
      (a, b) =>
        a.valveCode.localeCompare(b.valveCode) ||
        a.originalSize.localeCompare(b.originalSize),
    );
}

export function searchFlapSizes(query: string): FlapSizeMatch[] {
  return FLAP_VARIANTS.filter((flap) => sizeMatchesQuery(flap, query));
}

export function applicationNames(slugs: readonly string[]): string[] {
  return slugs
    .map((slug) => APPLICATION_BY_SLUG.get(slug)?.name)
    .filter((name): name is string => Boolean(name));
}

export function valveSizeLabel(valveCode: string, size: string): string {
  return `${valveCode} — ${size}`;
}

export function flapSizeLabel(size: string): string {
  return `Flap — ${size}`;
}

export const TUBES_STATS = {
  applications: TUBE_APPLICATIONS.length,
  valves: TUBE_VALVES.length,
  sizes: TUBE_VARIANTS.length,
  flapSizes: FLAP_VARIANTS.length,
} as const;

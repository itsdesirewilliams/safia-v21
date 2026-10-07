import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { listRangePatterns } from "@/lib/catalogue/range-data";

const PORT = 4339;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function loadDotEnvLocal(): Record<string, string> {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    const env: Record<string, string> = {};
    for (const line of raw.split(/\r?\n/)) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (match) {
        env[match[1]] = match[2].replace(/^"|"$/g, "");
      }
    }
    return env;
  } catch {
    return {};
  }
}

let server: ChildProcess | undefined;

async function waitForServer(url: string, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));
    }
  }
  throw new Error(`Server did not become ready at ${url}`);
}

beforeAll(async () => {
  const nextBin = resolve(
    process.cwd(),
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );

  server = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    cwd: process.cwd(),
    env: { ...process.env, ...loadDotEnvLocal() },
    stdio: "pipe",
  });

  await waitForServer(`${BASE_URL}/`);
}, 120_000);

afterAll(() => {
  server?.kill();
});

async function get(path: string): Promise<string> {
  const response = await fetch(`${BASE_URL}${path}`);
  expect(response.status, path).toBe(200);
  return response.text();
}

const TBR = listRangePatterns("tbr");
const PCR = listRangePatterns("pcr");

describe("TBR range", () => {
  it("index returns 200 with a card for every canonical Pattern Code", async () => {
    const html = await get("/products/truck-bus-tire/tbr-safeway");
    expect(html).toContain("Truck &amp; Bus Radial Tyres");
    for (const pattern of TBR) {
      expect(html, pattern.patternCode).toContain(
        `/products/truck-bus-tire/tbr-safeway/${pattern.slug}`,
      );
    }
  });

  it("renders the FM18 detail with the public spec table", async () => {
    const html = await get("/products/truck-bus-tire/tbr-safeway/fm18");
    expect(html).toContain("FM18");
    for (const header of ["Size", "Application", "LI/SR", "CC"]) {
      expect(html).toContain(header);
    }
    expect(html).toContain("Truck &amp; Bus");
    expect(html).toContain("7.50R16LT-16PR TL");
    expect(html).toContain("125/121L");
    expect(html).toContain("650");
  });

  it("resolves every canonical Pattern route", async () => {
    for (const pattern of TBR) {
      const response = await fetch(
        `${BASE_URL}/products/truck-bus-tire/tbr-safeway/${pattern.slug}`,
      );
      expect(response.status, pattern.slug).toBe(200);
    }
  });

  it("404s an unknown Pattern", async () => {
    const response = await fetch(
      `${BASE_URL}/products/truck-bus-tire/tbr-safeway/not-a-pattern`,
    );
    expect(response.status).toBe(404);
  });

  it("never exposes commercial fields", async () => {
    const html = await get("/products/truck-bus-tire/tbr-safeway/fm18");
    expect(html).not.toMatch(/FOB|USD|Filler|40HQ|Order Q|Total Amount/);
  });
});

describe("PCR range", () => {
  it("index returns 200 with a card for every canonical Pattern Code", async () => {
    const html = await get("/products/truck-bus-tire/pcr-safeway");
    expect(html).toContain("Passenger Car Radial Tyres");
    for (const pattern of PCR) {
      expect(html, pattern.patternCode).toContain(
        `/products/truck-bus-tire/pcr-safeway/${pattern.slug}`,
      );
    }
  });

  it("renders the FM316 detail with the public spec table", async () => {
    const html = await get("/products/truck-bus-tire/pcr-safeway/fm316");
    expect(html).toContain("FM316");
    for (const header of ["Size", "Application", "LI/SR", "CC"]) {
      expect(html).toContain(header);
    }
    expect(html).toContain("Passenger Car");
    expect(html).toContain("155/65R13");
    expect(html).toContain("73T");
    expect(html).toContain("2300");
  });

  it("resolves every canonical Pattern route", async () => {
    for (const pattern of PCR) {
      const response = await fetch(
        `${BASE_URL}/products/truck-bus-tire/pcr-safeway/${pattern.slug}`,
      );
      expect(response.status, pattern.slug).toBe(200);
    }
  });

  it("404s an unknown Pattern", async () => {
    const response = await fetch(
      `${BASE_URL}/products/truck-bus-tire/pcr-safeway/not-a-pattern`,
    );
    expect(response.status).toBe(404);
  });

  it("never exposes commercial fields", async () => {
    const html = await get("/products/truck-bus-tire/pcr-safeway/fm316");
    expect(html).not.toMatch(/FOB|USD|Filler|40HQ|Order Q|Total Amount/);
  });
});

describe("Truck & Bus navigation and Nylon boundary", () => {
  it("links Nylon, PCR and TBR from the Products menu", async () => {
    const html = await get("/");
    expect(html).toContain("/products/truck-bus");
    expect(html).toContain("/products/truck-bus-tire/pcr-safeway");
    expect(html).toContain("/products/truck-bus-tire/tbr-safeway");
    expect(html).toContain("Nylon Tyres");
  });

  it("keeps the existing Nylon Truck & Bus page working", async () => {
    const html = await get("/products/truck-bus");
    expect(html).toContain("TT-101");
    expect(html).not.toContain("/products/truck-bus-tire/tbr-safeway/fm18");
  });
});

describe("Truck & Bus range switcher", () => {
  const pages = [
    { path: "/products/truck-bus", active: "/products/truck-bus" },
    {
      path: "/products/truck-bus-tire/tbr-safeway",
      active: "/products/truck-bus-tire/tbr-safeway",
    },
    {
      path: "/products/truck-bus-tire/pcr-safeway",
      active: "/products/truck-bus-tire/pcr-safeway",
    },
  ];

  it.each(pages)(
    "appears on $path with the current range active",
    async ({ path, active }) => {
      const html = await get(path);

      const start = html.indexOf('aria-label="Product Ranges"');
      expect(start, "range switcher nav").toBeGreaterThan(-1);
      const switcher = html.slice(start, html.indexOf("</nav>", start));

      expect(switcher).toContain('href="/products/truck-bus"');
      expect(switcher).toContain('href="/products/truck-bus-tire/pcr-safeway"');
      expect(switcher).toContain('href="/products/truck-bus-tire/tbr-safeway"');

      // The active link carries aria-current="page".
      const activeHref = /aria-current="page"[^>]*href="([^"]+)"/.exec(
        switcher,
      )?.[1];
      expect(activeHref).toBe(active);
    },
  );
});

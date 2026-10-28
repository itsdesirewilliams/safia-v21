import { spawn, type ChildProcess } from "node:child_process";
import http from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PORT = 4324;
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

function requestWithHost(
  path: string,
  host: string,
): Promise<{ status: number; location: string | undefined; body: string }> {
  return new Promise((resolvePromise, reject) => {
    const req = http.get(
      { hostname: "127.0.0.1", port: PORT, path, headers: { host } },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () =>
          resolvePromise({
            status: res.statusCode ?? 0,
            location: res.headers.location,
            body,
          }),
        );
      },
    );
    req.on("error", reject);
  });
}

function jsonLdBlocks(html: string): unknown[] {
  const blocks = [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ];
  return blocks.flatMap((match) => {
    const parsed = JSON.parse(match[1]) as unknown;
    return Array.isArray(parsed) ? parsed : [parsed];
  });
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

  server = spawn(
    process.execPath,
    [nextBin, "start", "-H", "127.0.0.1", "-p", String(PORT)],
    {
      cwd: process.cwd(),
      env: { ...process.env, ...loadDotEnvLocal() },
      stdio: "pipe",
    },
  );

  await waitForServer(`${BASE_URL}/`);
}, 120_000);

afterAll(() => {
  server?.kill();
});

describe("robots.txt", () => {
  it("allows public pages, blocks private/internal URLs and points at the sitemap", async () => {
    const response = await fetch(`${BASE_URL}/robots.txt`);
    expect(response.status).toBe(200);
    const body = await response.text();

    expect(body).toContain("Sitemap: https://safewaytyre.com/sitemap.xml");
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Disallow: /api/");
    expect(body).toContain("Disallow: /search");
    expect(body).not.toContain("Disallow: /products/");
    expect(body).not.toContain("Disallow: /_next/");
  });
});

describe("sitemap.xml", () => {
  it("lists canonical pages, patterns and ranges without duplicates or private URLs", async () => {
    const response = await fetch(`${BASE_URL}/sitemap.xml`);
    expect(response.status).toBe(200);
    const xml = await response.text();

    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );
    expect(locs.length).toBeGreaterThan(100);
    expect(new Set(locs).size).toBe(locs.length);

    expect(locs).toContain("https://safewaytyre.com/");
    expect(locs).toContain("https://safewaytyre.com/products/agriculture");
    expect(locs).toContain(
      "https://safewaytyre.com/products/agriculture/bias-tractor-tyres-tr-1042",
    );
    expect(locs).toContain(
      "https://safewaytyre.com/products/truck-bus-tire/tbr-safeway",
    );
    expect(locs).toContain(
      "https://safewaytyre.com/products/truck-bus-tire/pcr-safeway",
    );
    expect(locs).toContain("https://safewaytyre.com/es/products/agriculture");
    expect(locs).toContain("https://safewaytyre.com/products/tubes");

    expect(xml).not.toContain("/admin");
    expect(xml).not.toContain("/api/");
    expect(xml).not.toContain("/search");
    expect(xml).not.toContain("fm57");
    expect(xml).not.toContain("draft");
  });
});

describe("homepage metadata and structured data", () => {
  it("has a single brand in the title, the right description and social tags", async () => {
    const html = await (await fetch(`${BASE_URL}/`)).text();

    const head = html.slice(0, html.indexOf("</head>"));
    const titles = [...head.matchAll(/<title>([^<]*)<\/title>/g)];
    expect(titles).toHaveLength(1);
    expect(titles[0][1]).toBe(
      "Safeway Tyre | Exporting Durable Tyres Worldwide",
    );

    expect(html).toContain(
      'name="description" content="Safeway Tyre (DEE RON Automotives LLP) manufactures and exports truck &amp; bus, agriculture, OTR, forklift, motorcycle and three-wheeler tyres from Ludhiana, India."',
    );
    expect(html).toContain('rel="canonical" href="https://safewaytyre.com"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain('hrefLang="x-default"');

    const schemas = jsonLdBlocks(html);
    expect(
      schemas.some((node) => (node as { "@type"?: string })["@type"] === "Organization"),
    ).toBe(true);
    expect(
      schemas.some((node) => (node as { "@type"?: string })["@type"] === "WebSite"),
    ).toBe(true);
  });

  it("serves the branded social card", async () => {
    const response = await fetch(`${BASE_URL}/opengraph-image`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/png");
  });
});

describe("category and pattern pages", () => {
  it("gives the category unique copy, a quote CTA and breadcrumb data", async () => {
    const html = await (await fetch(`${BASE_URL}/products/agriculture`)).text();

    expect(html).toContain("<title>Agriculture Tyres | Safeway Tyre</title>");
    expect(html).toContain(
      "Tyres for tractors, agricultural equipment and implements",
    );
    expect(html).toContain("Request a Quotation");
    expect(html).toContain('href="/products/otr"');

    const schemas = jsonLdBlocks(html);
    expect(
      schemas.some(
        (node) => (node as { "@type"?: string })["@type"] === "BreadcrumbList",
      ),
    ).toBe(true);
  });

  it("renders exactly one quotation panel per commercial page", async () => {
    for (const path of [
      "/products/agriculture",
      "/products/tubes",
      "/products/agriculture/bias-tractor-tyres-tr-1042",
    ]) {
      const html = await (await fetch(`${BASE_URL}${path}`)).text();
      const panels = [...html.matchAll(/data-testid="catalogue-enquiry"/g)];
      expect(panels, path).toHaveLength(1);
    }
  });

  it("gives the pattern a truthful Product schema and an enquiry CTA", async () => {
    const html = await (
      await fetch(`${BASE_URL}/products/agriculture/bias-tractor-tyres-tr-1042`)
    ).text();

    expect(html).toContain("TR-1042");
    expect(html).toContain("Request a Quotation");

    const schemas = jsonLdBlocks(html) as {
      "@type"?: string;
      sku?: string;
      offers?: unknown;
      aggregateRating?: unknown;
    }[];
    const product = schemas.find((node) => node["@type"] === "Product");
    expect(product).toBeDefined();
    expect(product?.sku).toBe("TR-1042");
    expect(product?.offers).toBeUndefined();
    expect(product?.aggregateRating).toBeUndefined();
  });
});

describe("indexability", () => {
  it("noindexes internal search and the admin login", async () => {
    const search = await (await fetch(`${BASE_URL}/search?q=295/80R22.5`)).text();
    expect(search).toContain('name="robots"');
    expect(search).toContain("noindex");

    const login = await (await fetch(`${BASE_URL}/admin/login`)).text();
    expect(login).toContain('name="robots"');
    expect(login).toContain("noindex");
  });

  it("redirects the www host to the apex without losing the path", async () => {
    const result = await requestWithHost(
      "/products/agriculture?ref=1",
      "www.safewaytyre.com",
    );
    expect(result.status).toBe(308);
    expect(result.location).toBe(
      "https://safewaytyre.com/products/agriculture?ref=1",
    );
  });

  it("redirects the www root to the apex", async () => {
    const result = await requestWithHost("/", "www.safewaytyre.com");
    expect(result.status).toBe(308);
    expect(result.location).toBe("https://safewaytyre.com");
  });

  it("keeps the /en and trailing-slash redirects single-hop", async () => {
    const prefixed = await fetch(`${BASE_URL}/en/about-us`, {
      redirect: "manual",
    });
    expect(prefixed.status).toBe(308);
    expect(prefixed.headers.get("location")).toContain("/about-us");

    const slash = await fetch(`${BASE_URL}/about-us/`, {
      redirect: "manual",
    });
    expect(slash.status).toBe(308);
  });
});

import { describe, expect, it } from "vitest";

import {
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
  organizationSchema,
  productSchema,
  websiteSchema,
} from "@/lib/seo/structured-data";

describe("Organization schema", () => {
  it("describes the company with verified public details only", () => {
    const schema = organizationSchema();

    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("Safeway Tyre");
    expect(schema.legalName).toBe("DEE RON Automotives LLP");
    expect(schema.url).toBe("https://safewaytyre.com");
    expect(schema.logo).toBe(
      "https://safewaytyre.com/brand/safeway-logo-black.png",
    );
    expect(schema.email).toBe("marketing@safewaytyre.com");
    expect(schema.telephone).toBe("+91 99157 62182");
    expect(schema.address).toMatchObject({
      "@type": "PostalAddress",
      addressLocality: "Ludhiana",
      postalCode: "142022",
      addressCountry: "IN",
    });
    expect(schema.sameAs).toHaveLength(5);

    // Nothing unverifiable is asserted.
    expect(schema).not.toHaveProperty("aggregateRating");
    expect(schema).not.toHaveProperty("award");
  });
});

describe("WebSite schema", () => {
  it("exposes the real catalogue search action", () => {
    const schema = websiteSchema();
    const action = schema.potentialAction as {
      target: { urlTemplate: string };
    };

    expect(schema["@type"]).toBe("WebSite");
    expect(schema.url).toBe("https://safewaytyre.com");
    expect(action.target.urlTemplate).toBe(
      "https://safewaytyre.com/search?q={search_term_string}",
    );
  });
});

describe("Breadcrumb schema", () => {
  it("numbers the trail and uses absolute URLs", () => {
    const schema = breadcrumbSchema([
      { name: "Catalogue", path: "/catalogue" },
      { name: "Agriculture", path: "/products/agriculture" },
    ]);
    const items = schema.itemListElement as {
      position: number;
      name: string;
      item: string;
    }[];

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      position: 1,
      name: "Catalogue",
      item: "https://safewaytyre.com/catalogue",
    });
    expect(items[1].position).toBe(2);
  });
});

describe("Product schema", () => {
  it("uses catalogue facts and never invents offers, prices or ratings", () => {
    const schema = productSchema({
      name: "Bias Tractor Tyres (TR-1042)",
      patternCode: "TR-1042",
      category: "Agriculture Tyres",
      path: "/products/agriculture/bias-tractor-tyres-tr-1042",
      description: "Safeway Tyre TR-1042",
      sizes: ["6.00-16", "6.50-16"],
    });

    expect(schema["@type"]).toBe("Product");
    expect(schema.sku).toBe("TR-1042");
    expect(schema.url).toBe(
      "https://safewaytyre.com/products/agriculture/bias-tractor-tyres-tr-1042",
    );
    expect(schema.brand).toEqual({ "@type": "Brand", name: "Safeway Tyre" });
    expect(schema.additionalProperty).toMatchObject({
      name: "Available sizes",
      value: "6.00-16, 6.50-16",
    });
    expect(schema).not.toHaveProperty("offers");
    expect(schema).not.toHaveProperty("aggregateRating");
    expect(schema).not.toHaveProperty("review");
  });
});

describe("Article schema", () => {
  it("describes a published post with its real author and dates", () => {
    const schema = articleSchema({
      headline: "Choosing a truck tyre",
      description: "A short guide.",
      path: "/blogs/choosing-a-truck-tyre",
      author: "Safeway Tyre",
      publishedAt: "2026-02-01T00:00:00.000Z",
      updatedAt: "2026-02-02T00:00:00.000Z",
      imageUrl: "https://cdn.example.test/image.jpg",
    });

    expect(schema["@type"]).toBe("BlogPosting");
    expect(schema.headline).toBe("Choosing a truck tyre");
    expect(schema.author).toEqual({ "@type": "Person", name: "Safeway Tyre" });
    expect(schema.publisher).toEqual({ "@id": "https://safewaytyre.com/#organization" });
    expect(schema.datePublished).toBe("2026-02-01T00:00:00.000Z");
    expect(schema.mainEntityOfPage).toBe(
      "https://safewaytyre.com/blogs/choosing-a-truck-tyre",
    );
  });
});

describe("FAQPage schema", () => {
  it("returns null when there are no FAQ items", () => {
    expect(faqPageSchema([])).toBeNull();
  });

  it("maps visible FAQ items to Question and Answer nodes", () => {
    const schema = faqPageSchema([
      { question: "Are tyres available?", answer: "Ask us for current sizes." },
    ]);
    const entities = schema?.mainEntity as {
      "@type": string;
      name: string;
      acceptedAnswer: { "@type": string; text: string };
    }[];

    expect(schema?.["@type"]).toBe("FAQPage");
    expect(entities).toHaveLength(1);
    expect(entities[0]["@type"]).toBe("Question");
    expect(entities[0].name).toBe("Are tyres available?");
    expect(entities[0].acceptedAnswer).toEqual({
      "@type": "Answer",
      text: "Ask us for current sizes.",
    });
  });
});
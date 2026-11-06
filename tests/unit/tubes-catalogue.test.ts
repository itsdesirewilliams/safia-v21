import { describe, expect, it } from "vitest";

import {
  TUBE_APPLICATIONS,
  TUBE_VALVES,
  TUBES_STATS,
  getValveByCode,
  listFlapSizes,
  listValveSizes,
  listValvesForApplication,
  searchFlapSizes,
  searchTubeSizes,
} from "@/lib/tubes/catalogue";
import {
  buildQuotationMessage,
  flapQuotationKey,
  tubeQuotationKey,
  type QuotationItem,
} from "@/lib/tubes/quotation";

describe("Tubes catalogue data", () => {
  it("defines the seven application groups in catalogue order", () => {
    expect(TUBE_APPLICATIONS.map((application) => application.name)).toEqual([
      "Agriculture, Industrial & OTR",
      "Bus / Light Truck & Truck",
      "Industrial Forklift & Truck",
      "Passenger Car",
      "Implement & Trailer",
      "Lawn & Garden",
      "Utility Vehicles",
    ]);
  });

  it("stores each valve type once even when it appears in several applications", () => {
    const codes = TUBE_VALVES.map((valve) => valve.code);
    expect(new Set(codes).size).toBe(codes.length);

    const tr15 = TUBE_VALVES.filter((valve) => valve.code === "TR-15");
    expect(tr15).toHaveLength(1);
    expect(tr15[0].applications).toEqual(
      expect.arrayContaining([
        "agriculture-industrial-otr",
        "bus-light-truck",
        "industrial-forklift-truck",
        "passenger-car",
        "implement-trailer",
      ]),
    );
  });

  it("publishes a non-empty, correctly associated valve list for every application", () => {
    for (const application of TUBE_APPLICATIONS) {
      const valves = listValvesForApplication(application.slug);
      expect(valves.length).toBeGreaterThan(0);
      for (const { valve, sizeCount } of valves) {
        expect(valve.applications).toContain(application.slug);
        expect(sizeCount).toBeGreaterThan(0);
      }
    }
  });

  it("retains every transcribed compatibility record", () => {
    expect(TUBES_STATS.sizes).toBe(395);
    expect(TUBES_STATS.valves).toBe(21);
    expect(TUBES_STATS.flapSizes).toBe(22);
  });

  it("lists the right valve products for an application", () => {
    const agriculture = listValvesForApplication("agriculture-industrial-otr");
    const codes = agriculture.map((entry) => entry.valve.code);
    expect(codes).toContain("TR-13");
    expect(codes).toContain("TR-15");
    expect(codes).toContain("TR-218A");
    expect(codes).toContain("TR-14");
    expect(codes).not.toContain("AC3 5 82");
  });

  it("returns every unique size for a valve while retaining source repetition", () => {
    const tr15 = getValveByCode("TR-15");
    expect(tr15).toBeTruthy();
    const sizes = listValveSizes(tr15!.id);
    const sixTeen = sizes.find((size) => size.originalSize === "6.00-16");
    expect(sixTeen).toBeTruthy();
    expect(sixTeen?.sourceRowCount).toBeGreaterThan(1);

    const tr13 = getValveByCode("TR-13")!;
    const tr13Sizes = listValveSizes(tr13.id);
    expect(tr13Sizes.map((size) => size.originalSize)).toEqual(
      expect.arrayContaining(["3.50-6", "4.00-8", "5.00-12", "235/75R15"]),
    );
  });

  it("keeps Flaps separate from valves", () => {
    const flaps = listFlapSizes();
    expect(flaps).toHaveLength(22);
    for (const flap of flaps) {
      expect(flap).not.toHaveProperty("valveId");
      expect(flap).not.toHaveProperty("valveCode");
    }
  });

  it("finds every valve and application for a size", () => {
    const matches = searchTubeSizes("4.00-8");
    expect(matches.length).toBeGreaterThan(1);
    expect(matches.some((match) => match.valveCode === "TR-13")).toBe(true);
    expect(matches.every((match) => match.originalSize === "4.00-8")).toBe(true);
    expect(matches.some((match) => match.applications.length > 1)).toBe(
      true,
    );
  });

  it("normalizes formatting variations without changing the display value", () => {
    for (const query of ["12.00-20", "12.00 20", "12-20", "120020"]) {
      const matches = searchTubeSizes(query);
      expect(matches.some((match) => match.originalSize === "12.00-20")).toBe(
        true,
      );
    }

    const weird = searchTubeSizes("11L.16");
    expect(weird.some((match) => match.originalSize === "11L.16")).toBe(true);
    expect(weird.every((match) => match.originalSize === "11L.16")).toBe(true);
  });

  it("searches flaps separately", () => {
    expect(searchFlapSizes("7.50-20").map((flap) => flap.originalSize)).toEqual([
      "7.50-20",
    ]);
    expect(searchFlapSizes("7.50 20")).toHaveLength(1);
  });

  it("builds one quotation message containing mixed tube and flap selections", () => {
    const items: QuotationItem[] = [
      {
        key: tubeQuotationKey("tr-13", "4.00-8"),
        kind: "tube",
        size: "4.00-8",
        valveCode: "TR-13",
        valveId: "tr-13",
        applications: ["Agriculture, Industrial & OTR"],
      },
      {
        key: tubeQuotationKey("tr-15", "5.00-12"),
        kind: "tube",
        size: "5.00-12",
        valveCode: "TR-15",
        valveId: "tr-15",
        applications: ["Passenger Car"],
      },
      {
        key: flapQuotationKey("7.50-20"),
        kind: "flap",
        size: "7.50-20",
        applications: [],
      },
    ];

    const message = buildQuotationMessage(items);
    expect(message).toContain("TR-13 — 4.00-8");
    expect(message).toContain("TR-15 — 5.00-12");
    expect(message).toContain("Flaps:");
    expect(message).toContain("7.50-20");
    expect(message).toContain("Please confirm availability and pricing.");
  });

  it("caps a large quotation message below the contact form limit", () => {
    const items: QuotationItem[] = Array.from({ length: 120 }, (_, index) => ({
      key: tubeQuotationKey(`valve-${index}`, `12.00-${index}`),
      kind: "tube",
      size: `12.00-${index}`,
      valveCode: `TR-${index}`,
      valveId: `valve-${index}`,
      applications: ["Agriculture, Industrial & OTR"],
    }));
    const message = buildQuotationMessage(items);
    expect(message.length).toBeLessThanOrEqual(3800);
    expect(message).toContain("...");
  });
});

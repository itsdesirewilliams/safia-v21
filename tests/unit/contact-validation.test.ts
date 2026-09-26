import { describe, expect, it } from "vitest";

import {
  normalizePhone,
  validateFeedbackForm,
  validateQueryForm,
} from "@/lib/contact/validation";

const VALID = {
  name: "Jane Importer",
  country: "KE",
  phone: "712 345678",
  category: ["truck-bus", "agriculture"],
  message: "We need 10.00-20 truck tyres, quantity 200.",
  honeypot: "",
};

const VALID_FEEDBACK = {
  name: "Jane Importer",
  country: "KE",
  phone: "712 345678",
  message: "The website was easy to use, thank you.",
  honeypot: "",
};

describe("validateQueryForm", () => {
  it("accepts a complete query and reports every selected category", () => {
    const result = validateQueryForm(VALID);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.categories).toEqual(["truck-bus", "agriculture"]);
      expect(result.value.name).toBe("Jane Importer");
      expect(result.value.country).toBe("KE");
    }
  });

  it("normalizes the national number to full international E.164", () => {
    const result = validateQueryForm({ ...VALID, phone: "712 345678" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.phone).toBe("+254712345678");
    }
  });

  it("requires name, country, phone, at least one category and message", () => {
    const result = validateQueryForm({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        "categories",
        "country",
        "message",
        "name",
        "phone",
      ]);
    }
  });

  it("rejects categories outside the canonical set", () => {
    const result = validateQueryForm({ ...VALID, category: ["spaceships"] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.categories).toBeTruthy();
    }
  });

  it("ignores an unknown category when at least one canonical is selected", () => {
    const result = validateQueryForm({
      ...VALID,
      category: ["truck-bus", "spaceships"],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.categories).toEqual(["truck-bus"]);
    }
  });

  it("rejects an unknown country", () => {
    const result = validateQueryForm({ ...VALID, country: "ZZ" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.country).toBeTruthy();
    }
  });

  it("rejects an unparseable phone number", () => {
    const result = validateQueryForm({ ...VALID, phone: "call me" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.phone).toBeTruthy();
    }
  });

  it("passes the honeypot through untouched", () => {
    const result = validateQueryForm({ ...VALID, honeypot: "bot" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.honeypot).toBe("bot");
    }
  });
});

describe("validateFeedbackForm", () => {
  it("accepts a complete feedback without a category", () => {
    const result = validateFeedbackForm(VALID_FEEDBACK);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Jane Importer");
      expect(result.value).not.toHaveProperty("categories");
    }
  });

  it("requires name, country, phone and message", () => {
    const result = validateFeedbackForm({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        "country",
        "message",
        "name",
        "phone",
      ]);
    }
  });

  it("ignores a supplied category", () => {
    const result = validateFeedbackForm({ ...VALID_FEEDBACK, category: ["tubes"] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toHaveProperty("categories");
    }
  });

  it("applies the same phone rule as the inquiry form", () => {
    const result = validateFeedbackForm({ ...VALID_FEEDBACK, phone: "1" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.phone).toBeTruthy();
    }
  });

  it("passes the honeypot through untouched", () => {
    const result = validateFeedbackForm({ ...VALID_FEEDBACK, honeypot: "bot" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.honeypot).toBe("bot");
    }
  });
});

describe("normalizePhone", () => {
  it.each([
    ["9915762182", "IN", "+919915762182"],
    ["712 345678", "KE", "+254712345678"],
    ["4155552671", "US", "+14155552671"],
    ["020 7946 0958", "GB", "+442079460958"],
  ])("normalizes %s (%s) to %s", (national, country, expected) => {
    expect(normalizePhone(national, country)).toBe(expected);
  });

  it.each([
    ["", "IN"],
    ["123", "KE"],
    ["call me", "IN"],
    ["9915762182", "ZZ"],
    ["9915762182", ""],
  ])("rejects %s for country %s", (national, country) => {
    expect(normalizePhone(national, country)).toBeNull();
  });
});

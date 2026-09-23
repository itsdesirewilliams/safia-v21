import { describe, expect, it } from "vitest";

import {
  isValidPhone,
  validateFeedbackForm,
  validateQueryForm,
} from "@/lib/contact/validation";

const VALID = {
  name: "Jane Importer",
  country: "Kenya",
  phone: "+254 712 345678",
  category: "truck-bus",
  message: "We need 10.00-20 truck tyres, quantity 200.",
  honeypot: "",
};

const VALID_FEEDBACK = {
  name: "Jane Importer",
  country: "Kenya",
  phone: "+254 712 345678",
  message: "The website was easy to use, thank you.",
  honeypot: "",
};

describe("validateQueryForm", () => {
  it("accepts a complete query", () => {
    const result = validateQueryForm(VALID);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.category).toBe("truck-bus");
      expect(result.value.name).toBe("Jane Importer");
    }
  });

  it("requires name, country, phone, category and message", () => {
    const result = validateQueryForm({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        "category",
        "country",
        "message",
        "name",
        "phone",
      ]);
    }
  });

  it("rejects a category outside the canonical set", () => {
    const result = validateQueryForm({ ...VALID, category: "spaceships" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.category).toBeTruthy();
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
      expect(result.value).not.toHaveProperty("category");
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
    const result = validateFeedbackForm({ ...VALID_FEEDBACK, category: "tubes" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).not.toHaveProperty("category");
    }
  });

  it("applies the same phone rule as the query form", () => {
    const result = validateFeedbackForm({ ...VALID_FEEDBACK, phone: "123" });
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

describe("isValidPhone", () => {
  it.each(["+91 99157 62182", "254712345678", "(020) 7946 0958", "+1-202-555-0173"])(
    "accepts %s",
    (phone) => {
      expect(isValidPhone(phone)).toBe(true);
    },
  );

  it.each(["", "123", "not a phone", "+12345678901234567890"])(
    "rejects %s",
    (phone) => {
      expect(isValidPhone(phone)).toBe(false);
    },
  );
});

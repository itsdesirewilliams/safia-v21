import { describe, expect, it, vi } from "vitest";

import { ConfigError } from "@/lib/config";
import type { ContactSubmission } from "@/lib/contact/email";
import { processContactSubmission } from "@/lib/contact/submit";

const QUERY = {
  name: "Jane Importer",
  country: "KE",
  phone: "712 345678",
  category: ["truck-bus", "agriculture"],
  message: "We need 10.00-20 truck tyres, quantity 200.",
  honeypot: "",
};

const FEEDBACK = {
  name: "Jane Importer",
  country: "KE",
  phone: "712 345678",
  message: "The catalogue was easy to use.",
  honeypot: "",
};

function deps(overrides?: {
  send?: (submission: ContactSubmission) => Promise<void>;
  allow?: (key: string) => boolean;
}) {
  return {
    send: overrides?.send ?? vi.fn().mockResolvedValue(undefined),
    allow: overrides?.allow ?? vi.fn().mockReturnValue(true),
  };
}

describe("processContactSubmission — query", () => {
  it("emails a valid query to the shared pipeline", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const result = await processContactSubmission(
      "query",
      QUERY,
      "203.0.113.1",
      deps({ send }),
    );

    expect(result.status).toBe("success");
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({
      formType: "query",
      name: "Jane Importer",
      country: "KE",
      phone: "+254 712 345678",
      categories: ["truck-bus", "agriculture"],
    });
  });

  it("rejects an invalid query without sending", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const result = await processContactSubmission(
      "query",
      { ...QUERY, phone: "123" },
      "203.0.113.1",
      deps({ send }),
    );

    expect(result.status).toBe("error");
    expect(result.errors?.phone).toBeTruthy();
    expect(result.values?.phone).toBe("123");
    expect(send).not.toHaveBeenCalled();
  });
});

describe("processContactSubmission — feedback", () => {
  it("emails a valid feedback without a category", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const result = await processContactSubmission(
      "feedback",
      FEEDBACK,
      "203.0.113.1",
      deps({ send }),
    );

    expect(result.status).toBe("success");
    expect(send).toHaveBeenCalledTimes(1);
    const submission = send.mock.calls[0][0];
    expect(submission.formType).toBe("feedback");
    expect(submission).not.toHaveProperty("categories");
  });
});

describe("processContactSubmission — protections", () => {
  it("silently accepts a tripped honeypot without sending", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const result = await processContactSubmission(
      "query",
      { ...QUERY, honeypot: "bot-filled" },
      "203.0.113.1",
      deps({ send }),
    );

    expect(result.status).toBe("success");
    expect(send).not.toHaveBeenCalled();
  });

  it("returns a clean error when rate limited", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const result = await processContactSubmission(
      "query",
      QUERY,
      "203.0.113.1",
      deps({ send, allow: () => false }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/too many submissions/i);
    expect(send).not.toHaveBeenCalled();
  });

  it("reports a graceful message when email is not configured", async () => {
    const send = vi.fn().mockRejectedValue(new ConfigError(["EMAIL_TRANSPORT_HOST"]));
    const result = await processContactSubmission(
      "query",
      QUERY,
      "203.0.113.1",
      deps({ send }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/whatsapp/i);
  });

  it("reports a generic failure when delivery throws", async () => {
    const send = vi.fn().mockRejectedValue(new Error("smtp exploded"));
    const result = await processContactSubmission(
      "feedback",
      FEEDBACK,
      "203.0.113.1",
      deps({ send }),
    );

    expect(result.status).toBe("error");
    expect(result.message).not.toContain("smtp exploded");
    expect(result.message).toMatch(/try again|whatsapp/i);
  });
});

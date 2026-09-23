import { describe, expect, it, vi } from "vitest";

import {
  CONTACT_RECIPIENTS,
  buildContactEmail,
  sanitizeHeaderValue,
  sendContactEmail,
  type ContactSubmission,
} from "@/lib/contact/email";

const SUBMISSION: ContactSubmission = {
  formType: "query",
  name: "Jane Importer",
  country: "Kenya",
  phone: "+254 712 345678",
  category: "truck-bus",
  message: "We need 10.00-20 truck tyres.",
};

const FEEDBACK: ContactSubmission = {
  formType: "feedback",
  name: "Jane Importer",
  country: "Kenya",
  phone: "+254 712 345678",
  message: "The catalogue was easy to use.",
};

describe("contact email contract", () => {
  it("targets both fixed Safeway addresses", () => {
    expect(CONTACT_RECIPIENTS).toEqual([
      "Director@safewaytyre.com",
      "marketing01@safewaytyre.com",
    ]);

    const message = buildContactEmail(SUBMISSION, "no-reply@safewaytyre.com");
    expect(message.to).toEqual([...CONTACT_RECIPIENTS]);
    expect(message.text).toContain("Jane Importer");
    expect(message.text).toContain("Kenya");
    expect(message.text).toContain("Truck & Bus Tyres");
  });

  it("labels a query clearly and includes the canonical category name", () => {
    const message = buildContactEmail(SUBMISSION, "no-reply@safewaytyre.com");
    expect(message.subject).toContain("Query");
    expect(message.text).toContain("New Query");
    expect(message.text).toContain("Category: Truck & Bus Tyres");
    expect(message.text).not.toContain("Category: truck-bus");
  });

  it("labels feedback clearly and omits the category", () => {
    const message = buildContactEmail(FEEDBACK, "no-reply@safewaytyre.com");
    expect(message.subject).toContain("Feedback");
    expect(message.text).toContain("New Feedback");
    expect(message.text).not.toContain("Category:");
  });

  it("sends through the injected transport", async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);

    await sendContactEmail(SUBMISSION, {
      transport: { sendMail },
      from: "no-reply@safewaytyre.com",
    });

    expect(sendMail).toHaveBeenCalledTimes(1);
    const message = sendMail.mock.calls[0][0];
    expect(message.to).toEqual([...CONTACT_RECIPIENTS]);
  });
});

describe("header injection protection", () => {
  it("strips CR/LF and control characters from header values", () => {
    expect(sanitizeHeaderValue("Jane\r\nBcc: attacker@example.com")).toBe(
      "Jane Bcc: attacker@example.com",
    );
    expect(sanitizeHeaderValue("Jane\u0000\u001f Importer")).toBe(
      "Jane Importer",
    );
  });

  it("never places a raw newline in the subject", () => {
    const message = buildContactEmail(
      {
        ...SUBMISSION,
        name: "Jane\r\nBcc: attacker@example.com",
      },
      "no-reply@safewaytyre.com",
    );

    expect(message.subject).not.toContain("\n");
    expect(message.subject).not.toContain("\r");
  });
});

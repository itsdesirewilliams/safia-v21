import { describe, expect, it, vi } from "vitest";

import {
  CONTACT_RECIPIENTS,
  buildContactEmail,
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
    expect(message.text).toContain("truck-bus");
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

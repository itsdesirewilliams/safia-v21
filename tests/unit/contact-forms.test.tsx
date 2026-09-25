import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ContactForms } from "@/components/contact/contact-forms";
import { FeedbackForm } from "@/components/contact/feedback-form";
import { QueryForm } from "@/components/contact/query-form";
import { CATEGORIES } from "@/lib/catalogue/categories";

const PRODUCT_CATEGORIES = CATEGORIES.filter(
  (category) => category.slug !== "tubes",
);

describe("Inquiry form", () => {
  const html = renderToStaticMarkup(<QueryForm />);

  it("renders the required fields", () => {
    for (const label of ["Name", "Country", "Phone", "Message"]) {
      expect(html).toContain(`>${label} <`);
    }
    expect(html).toContain("Which category are you interested in?");
  });

  it("offers the six product categories as checkboxes", () => {
    expect(html.match(/name="category"/g)).toHaveLength(
      PRODUCT_CATEGORIES.length,
    );

    for (const category of PRODUCT_CATEGORIES) {
      expect(html).toContain(`value="${category.slug}"`);
      const escapedLabel = category.displayName.replace(/&/g, "&amp;");
      expect(html).toContain(escapedLabel);
    }

    expect(html).not.toContain('value="tubes"');
  });

  it("carries a hidden honeypot field", () => {
    expect(html).toContain('name="company"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('tabindex="-1"');
  });

  it("submits with a single labelled button", () => {
    expect(html).toContain('type="submit"');
    expect(html).toContain("Send Inquiry");
  });
});

describe("Feedback form", () => {
  const html = renderToStaticMarkup(<FeedbackForm />);

  it("renders the simpler feedback fields without a category", () => {
    for (const label of ["Name", "Country", "Phone", "Message"]) {
      expect(html).toContain(`>${label} <`);
    }
    expect(html).not.toContain("Which category");
    expect(html).not.toContain('name="category"');
  });

  it("carries a hidden honeypot field and a submit button", () => {
    expect(html).toContain('name="company"');
    expect(html).toContain("Send Feedback");
  });
});

describe("Contact forms tabs", () => {
  const html = renderToStaticMarkup(<ContactForms />);

  it("renders an accessible tablist with both forms", () => {
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
    expect(html).toContain("Inquiry Form");
    expect(html).toContain("Feedback");
    expect(html).toContain('id="contact-panel-query"');
    expect(html).toContain('id="contact-panel-feedback"');
  });

  it("shows the inquiry panel and hides the feedback panel initially", () => {
    expect(html).toMatch(/id="contact-panel-query"[^>]*role="tabpanel"/);
    expect(html).toMatch(/id="contact-panel-feedback"[^>]*hidden/);
  });
});

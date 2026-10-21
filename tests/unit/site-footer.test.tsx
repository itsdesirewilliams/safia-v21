import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: () => null,
}));

import { SiteFooter } from "@/components/site-footer";
import { en } from "@/lib/i18n/dictionaries/en";
import { SITE } from "@/lib/site";

function renderFooter() {
  return renderToStaticMarkup(<SiteFooter locale="en" dict={en} />);
}

describe("footer call to action", () => {
  it("keeps the heading and the email address", () => {
    const html = renderFooter();

    expect(html).toContain("Sourcing Tyres?");
    expect(html).toContain("Start the Conversation.");
    expect(html).toContain(`mailto:${SITE.emails.director}`);
    expect(html).toContain(SITE.emails.director);
  });

  it("no longer shows the company name under the email address", () => {
    const html = renderFooter();

    // The call to action is the block between the heading and the footer grid.
    const cta = html.slice(
      html.indexOf("Start the Conversation."),
      html.indexOf('class="mt-14 grid'),
    );
    expect(cta).toContain(SITE.emails.director);
    expect(cta).not.toContain(SITE.legalName);

    // The company name is still used in the copyright line, and nowhere else.
    expect(html.split(SITE.legalName)).toHaveLength(2);
  });

  it("keeps the company name in the copyright line", () => {
    const html = renderFooter();

    expect(html).toContain(`© ${new Date().getFullYear()} ${SITE.legalName}`);
    expect(html).toContain(en.footer.rights);
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AboutBio } from "@/components/about-us/about-bio";
import { AboutBusinessProfile } from "@/components/about-us/about-business-profile";
import { AboutTeam } from "@/components/about-us/about-team";
import type { TeamMember } from "@/lib/about-us";

describe("About Us bio", () => {
  it("leads with the About heading and links onward", () => {
    const html = renderToStaticMarkup(<AboutBio />);

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("About Safeway Tyre");
    expect(html).toContain('href="/catalogue"');
    expect(html).toContain('href="/contact-us"');
  });
});

describe("About Us team", () => {
  it("shows a labelled placeholder when no members are supplied", () => {
    const html = renderToStaticMarkup(<AboutTeam members={[]} />);

    expect(html).toContain("Team Profiles Coming Soon");
  });

  it("renders a card per member", () => {
    const members: TeamMember[] = [
      { name: "Ada Lovelace", role: "Director", bio: "Leads the company." },
      { name: "Alan Turing", role: "Operations" },
    ];

    const html = renderToStaticMarkup(<AboutTeam members={members} />);

    expect(html).toContain("Ada Lovelace");
    expect(html).toContain("Director");
    expect(html).toContain("Alan Turing");
    expect(html).not.toContain("Team Profiles Coming Soon");
  });
});

describe("About Us business profile", () => {
  it("renders the shared slider with business-profile art direction", () => {
    const html = renderToStaticMarkup(<AboutBusinessProfile />);

    expect(html).toContain("Explore Business Profile");
    expect(html).toContain('aria-roledescription="carousel"');
    expect(html).toContain('aria-label="Business Profile"');
    expect(html).toContain('media="(max-width: 767px)"');
    expect(html).toContain(
      "/assets/landscape/business-profile/business-profile-1.svg",
    );
    expect(html).toContain(
      "/assets/portrait/business-profile/business-profile-1.svg",
    );
    expect(html).not.toContain("object-fit");
  });
});

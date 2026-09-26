import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AboutBio } from "@/components/about-us/about-bio";
import { AboutBusinessProfile } from "@/components/about-us/about-business-profile";
import { AboutTeam } from "@/components/about-us/about-team";
import type { TeamMember } from "@/lib/about-us";

describe("About Us bio", () => {
  it("leads with the About heading and is not CTA-driven", () => {
    const html = renderToStaticMarkup(<AboutBio />);

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("About Safeway Tyre");
    expect(html).not.toContain("<a ");
  });
});

describe("About Us team", () => {
  it("shows a labelled placeholder when no members are supplied", () => {
    const html = renderToStaticMarkup(<AboutTeam members={[]} />);

    expect(html).toContain("Team Profiles Coming Soon");
  });

  it("overlays the name and position on the image with the quote below", () => {
    const members: TeamMember[] = [
      { name: "Ada Lovelace", role: "Director", bio: "Leads the company." },
      { name: "Alan Turing", role: "Operations" },
    ];

    const html = renderToStaticMarkup(<AboutTeam members={members} />);

    expect(html).toContain("Ada Lovelace");
    expect(html).toContain("Director");
    expect(html).toContain("Alan Turing");
    expect(html).toContain("Leads the company.");
    // Readable scrim behind the overlaid name, over the placeholder portrait.
    expect(html).toContain("from-ink-950/90");
    expect(html).toContain("Portrait placeholder");
    expect(html).not.toContain("Team Profiles Coming Soon");
  });

  it("uses a supplied portrait instead of the placeholder when present", () => {
    const members: TeamMember[] = [
      {
        name: "Grace Hopper",
        role: "Advisor",
        image: "/media/team/grace.jpg",
      },
    ];

    const html = renderToStaticMarkup(<AboutTeam members={members} />);

    expect(html).toContain('src="/media/team/grace.jpg"');
    expect(html).not.toContain("Portrait placeholder");
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

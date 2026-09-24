import { describe, expect, it } from "vitest";

import {
  ABOUT_BIO,
  ABOUT_BUSINESS_PROFILE,
  ABOUT_TEAM,
} from "@/lib/about-us";
import { buildSliderSlides, resolveSlideSource } from "@/lib/media/slider";

/**
 * About Us is developer-owned: the bio, the Team section and the Business
 * Profile slider are the only three sections, and no content is invented.
 */

describe("About Us content", () => {
  it("carries the company bio as the page heading", () => {
    expect(ABOUT_BIO.title).toBe("About Safeway Tyre");
    expect(ABOUT_BIO.paragraphs.length).toBeGreaterThan(0);

    for (const paragraph of ABOUT_BIO.paragraphs) {
      expect(paragraph.trim().length).toBeGreaterThan(0);
    }
  });

  it("names the Team section and its labelled empty state", () => {
    expect(ABOUT_TEAM.title.length).toBeGreaterThan(0);
    expect(ABOUT_TEAM.empty.label.length).toBeGreaterThan(0);
    expect(ABOUT_TEAM.empty.detail.length).toBeGreaterThan(0);
  });

  it("names the Business Profile section", () => {
    expect(ABOUT_BUSINESS_PROFILE.title).toBe("Explore Business Profile");
  });
});

describe("Business Profile artwork discovery", () => {
  const LANDSCAPE = ["business-profile-1.svg", "business-profile-2.svg"];
  const PORTRAIT = ["business-profile-1.svg", "business-profile-2.svg"];

  it("resolves portrait below 768px and landscape at 768px and above", () => {
    const slides = buildSliderSlides("business-profile", LANDSCAPE, PORTRAIT);

    expect(slides).toHaveLength(2);

    for (const slide of slides) {
      expect(resolveSlideSource(slide, 480)).toBe(
        `/assets/portrait/business-profile/${slide.filename}`,
      );
      expect(resolveSlideSource(slide, 1024)).toBe(
        `/assets/landscape/business-profile/${slide.filename}`,
      );
    }
  });

  it("never substitutes one ratio for the other", () => {
    const [slide] = buildSliderSlides(
      "business-profile",
      ["business-profile-1.svg"],
      ["business-profile-1.svg"],
    );

    expect(slide.landscape).not.toBe(slide.portrait);
    expect(resolveSlideSource(slide, 480)).toContain("/portrait/");
    expect(resolveSlideSource(slide, 1024)).toContain("/landscape/");
  });
});

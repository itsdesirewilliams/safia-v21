import { describe, expect, it } from "vitest";

import {
  matchTeamImage,
  TEAM_ASSET_ROOT,
  teamImageUrl,
} from "@/lib/media/team-assets";

describe("team portrait discovery", () => {
  it("matches a portrait by the slug of the member name", () => {
    expect(matchTeamImage("desire-williams", ["desire-williams.webp"])).toBe(
      "desire-williams.webp",
    );
    expect(matchTeamImage("sandeep-chaudhary", ["sandeep-chaudhary.jpg"])).toBe(
      "sandeep-chaudhary.jpg",
    );
  });

  it("matches another supported extension case-insensitively", () => {
    expect(matchTeamImage("shubhika-batra", ["Shubhika-Batra.PNG"])).toBe(
      "Shubhika-Batra.PNG",
    );
  });

  it("returns null when no portrait is supplied for the member", () => {
    expect(matchTeamImage("shubhika-batra", ["someone-else.webp"])).toBeNull();
    expect(matchTeamImage("desire-williams", [])).toBeNull();
  });

  it("builds a public URL under /assets/team", () => {
    expect(teamImageUrl("desire-williams.webp")).toBe(
      `${TEAM_ASSET_ROOT}/desire-williams.webp`,
    );
  });
});

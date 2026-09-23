import { describe, expect, it } from "vitest";

import {
  evaluateMediaDeletion,
  mapMediaReferences,
  type MediaReference,
} from "@/lib/media/deletion";

function postReference(id: string, label: string): MediaReference {
  return { kind: "post", id, label };
}

describe("evaluateMediaDeletion", () => {
  it("allows deletion when nothing references the media", () => {
    expect(evaluateMediaDeletion([])).toEqual({ allowed: true, reason: null });
  });

  it("blocks deletion when a Post references the media", () => {
    const decision = evaluateMediaDeletion([
      postReference("post-1", "Safeway at the expo"),
    ]);

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("Post");
    expect(decision.reason).toContain("Safeway at the expo");
  });

  it("names the count when several references block deletion", () => {
    const decision = evaluateMediaDeletion([
      postReference("post-1", "First post"),
      postReference("post-2", "Second post"),
    ]);

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("2");
  });

  it("never silently allows deletion while referenced", () => {
    const decision = evaluateMediaDeletion([
      postReference("post-9", "Draft post"),
    ]);
    expect(decision.allowed).toBe(false);
  });
});

describe("mapMediaReferences", () => {
  it("maps valid reference rows from the database", () => {
    expect(
      mapMediaReferences([
        { kind: "post", id: "p1", label: "Safeway at the expo" },
      ]),
    ).toEqual([{ kind: "post", id: "p1", label: "Safeway at the expo" }]);
  });

  it("ignores malformed or unknown reference rows", () => {
    expect(
      mapMediaReferences([
        { kind: "spaceship", id: "x", label: "nope" },
        { kind: "post", id: "", label: "no id" },
        null,
        "nonsense",
      ]),
    ).toEqual([]);
  });

  it("returns an empty list for a non-array payload", () => {
    expect(mapMediaReferences(null)).toEqual([]);
    expect(mapMediaReferences({})).toEqual([]);
  });
});

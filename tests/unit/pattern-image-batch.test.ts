import { describe, expect, it } from "vitest";

import {
  buildPatternImagePath,
  isSafePatternImagePath,
  lookupPatternCode,
  normalizePatternCode,
  patternCodeFromFileName,
  planPatternImageFiles,
  PATTERN_IMAGE_ACCEPT,
  PATTERN_IMAGE_BATCH_MAX,
  PATTERN_IMAGE_BUCKET_ID,
  type PatternImageDirectoryEntry,
} from "@/lib/media/pattern-image-batch";

const DIRECTORY: PatternImageDirectoryEntry[] = [
  {
    patternCode: "SFM-101",
    displayName: "Motorcycle Tyres",
    categorySlug: "motorcycle",
    categoryName: "Motorcycle Tyres",
    range: "Motorcycle Tyres",
  },
  {
    patternCode: "TR-1019",
    displayName: "AGRICULTURE IMPLEMENT TYRE",
    categorySlug: "agriculture",
    categoryName: "Agriculture Tyres",
    range: "Agriculture Tyres",
  },
  {
    patternCode: "POWERMINER",
    displayName: "Truck & Bus Tyres",
    categorySlug: "truck-bus",
    categoryName: "Truck & Bus Tyres",
    range: "Nylon",
  },
];

describe("pattern code extraction", () => {
  it("strips the extension, trims spaces and ignores case", () => {
    expect(patternCodeFromFileName("SFM-101.jpg")).toBe("SFM-101");
    expect(patternCodeFromFileName("TR-1019.png")).toBe("TR-1019");
    expect(patternCodeFromFileName("  tw-17.webp ")).toBe("TW-17");
    expect(patternCodeFromFileName("OT-E3.jpeg")).toBe("OT-E3");
    expect(patternCodeFromFileName("POWERMINER.avif")).toBe("POWERMINER");
  });

  it("extracts the raw stem, while lookup tolerates separators", () => {
    // Extraction preserves the stem exactly; the alias-tolerant lookup then
    // treats separators as equivalent, so `SFM101` resolves to `SFM-101`.
    expect(patternCodeFromFileName("SFM101.jpg")).toBe("SFM101");
    expect(lookupPatternCode("SFM101", DIRECTORY).status).toBe("matched");
  });

  it("returns null when the filename has no stem", () => {
    expect(patternCodeFromFileName(".jpg")).toBeNull();
    expect(patternCodeFromFileName("   ")).toBeNull();
  });

  it("normalizes for comparison", () => {
    expect(normalizePatternCode(" sfm-101 ")).toBe("SFM-101");
  });
});

describe("pattern code lookup", () => {
  it("matches exactly one canonical code", () => {
    const result = lookupPatternCode("sfm-101", DIRECTORY);
    expect(result.status).toBe("matched");
    if (result.status === "matched") {
      expect(result.entry.patternCode).toBe("SFM-101");
      expect(result.entry.categoryName).toBe("Motorcycle Tyres");
    }
  });

  it("reports a missing code", () => {
    expect(lookupPatternCode("UNKNOWN-123", DIRECTORY).status).toBe(
      "not-found",
    );
  });

  it("reports an ambiguous code", () => {
    const ambiguous = [
      ...DIRECTORY,
      { ...DIRECTORY[0], categorySlug: "other" as never },
    ];
    expect(lookupPatternCode("SFM-101", ambiguous).status).toBe("ambiguous");
  });
});

describe("batch planning", () => {
  it("marks a resolvable, new file ready with its match", () => {
    const [plan] = planPatternImageFiles(["SFM-101.jpg"], DIRECTORY, new Set());
    expect(plan.status).toBe("ready");
    expect(plan.code).toBe("SFM-101");
    expect(plan.entry?.categorySlug).toBe("motorcycle");
  });

  it("marks a file whose code is already associated as exists", () => {
    const [plan] = planPatternImageFiles(
      ["SFM-101.jpg"],
      DIRECTORY,
      new Set(["SFM-101"]),
    );
    expect(plan.status).toBe("exists");
    expect(plan.reason).toBe("Image already exists");
  });

  it("fails an unrecognised code with an explicit reason", () => {
    const [plan] = planPatternImageFiles(
      ["UNKNOWN-123.jpg"],
      DIRECTORY,
      new Set(),
    );
    expect(plan.status).toBe("failed");
    expect(plan.reason).toBe("Pattern Code not found");
  });

  it("fails the second file when two in a batch share a code", () => {
    const plans = planPatternImageFiles(
      ["SFM-101.jpg", "sfm-101.png"],
      DIRECTORY,
      new Set(),
    );
    expect(plans[0].status).toBe("ready");
    expect(plans[1].status).toBe("failed");
  });

  it("fails a filename with no code", () => {
    const [plan] = planPatternImageFiles([".jpg"], DIRECTORY, new Set());
    expect(plan.status).toBe("failed");
    expect(plan.code).toBeNull();
  });
});

describe("pattern image paths", () => {
  it("builds a safe, lower-cased, code-scoped key", () => {
    const path = buildPatternImagePath(
      "SFM-101",
      "123e4567-e89b-12d3-a456-426614174000",
      "sfm-101.jpg",
    );
    expect(path).toBe(
      "patterns/sfm-101/123e4567-e89b-12d3-a456-426614174000-sfm-101.jpg",
    );
    expect(isSafePatternImagePath(path)).toBe(true);
  });

  it("rejects traversal, stray folders and malformed keys", () => {
    for (const bad of [
      "../sfm-101.jpg",
      "patterns/../x.jpg",
      "sfm-101.jpg",
      "patterns/SFM-101/x.jpg",
      "patterns/sfm-101/a/b.jpg",
      "",
    ]) {
      expect(isSafePatternImagePath(bad)).toBe(false);
    }
  });
});

describe("pattern image upload contract", () => {
  it("targets the dedicated bucket, not the Gallery", () => {
    expect(PATTERN_IMAGE_BUCKET_ID).toBe("product-images");
  });

  it("exposes an image-only accept hint and a sane cap", () => {
    expect(PATTERN_IMAGE_ACCEPT).not.toContain("video");
    expect(PATTERN_IMAGE_ACCEPT).toContain("image/jpeg");
    expect(PATTERN_IMAGE_BATCH_MAX).toBeGreaterThan(1);
  });
});

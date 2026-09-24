import { describe, expect, it } from "vitest";

import {
  DEFAULT_GALLERY_CAPTION,
  discoverGalleryImages,
  isGalleryImage,
  type GalleryFile,
  type GalleryMetadata,
} from "@/lib/media/gallery";

function files(...entries: Array<[string, string]>): GalleryFile[] {
  return entries.map(([path, createdAt]) => ({ path, createdAt }));
}

function metadata(
  ...entries: Array<Partial<GalleryMetadata> & { path: string }>
): GalleryMetadata[] {
  return entries.map((entry) => ({
    caption: null,
    alt: null,
    ...entry,
  }));
}

describe("supported gallery formats", () => {
  it("treats only image extensions as gallery images", () => {
    for (const path of [
      "2026-09/a.jpg",
      "2026-09/a.jpeg",
      "2026-09/a.png",
      "2026-09/a.webp",
      "2026-09/a.avif",
      "2026-09/a.gif",
      "2026-09/a.PNG",
    ]) {
      expect(isGalleryImage(path)).toBe(true);
    }

    expect(isGalleryImage("2026-09/clip.mp4")).toBe(false);
    expect(isGalleryImage("2026-09/notes.pdf")).toBe(false);
    expect(isGalleryImage("2026-09/drawing.svg")).toBe(false);
  });
});

describe("gallery discovery", () => {
  it("orders images newest first by storage creation time", () => {
    const images = discoverGalleryImages({
      files: files(
        ["2026-09/oldest.png", "2026-09-01T00:00:00.000Z"],
        ["2026-09/newest.png", "2026-09-20T00:00:00.000Z"],
        ["2026-09/middle.png", "2026-09-10T00:00:00.000Z"],
      ),
    });

    expect(images.map((image) => image.path)).toEqual([
      "2026-09/newest.png",
      "2026-09/middle.png",
      "2026-09/oldest.png",
    ]);
  });

  it("breaks ties by path so ordering is deterministic", () => {
    const images = discoverGalleryImages({
      files: files(
        ["2026-09/b.png", "2026-09-10T00:00:00.000Z"],
        ["2026-09/a.png", "2026-09-10T00:00:00.000Z"],
      ),
    });

    expect(images.map((image) => image.path)).toEqual([
      "2026-09/a.png",
      "2026-09/b.png",
    ]);
  });

  it("ignores unsupported files", () => {
    const images = discoverGalleryImages({
      files: files(
        ["2026-09/photo.png", "2026-09-10T00:00:00.000Z"],
        ["2026-09/clip.mp4", "2026-09-11T00:00:00.000Z"],
        ["2026-09/notes.pdf", "2026-09-12T00:00:00.000Z"],
      ),
    });

    expect(images.map((image) => image.path)).toEqual(["2026-09/photo.png"]);
  });

  it("defaults caption and alt to Safeway Tyre when no metadata exists", () => {
    const [image] = discoverGalleryImages({
      files: files(["2026-09/photo.png", "2026-09-10T00:00:00.000Z"]),
    });

    expect(image.caption).toBe(DEFAULT_GALLERY_CAPTION);
    expect(image.alt).toBe(DEFAULT_GALLERY_CAPTION);
  });

  it("overrides caption and alt from the Media record", () => {
    const [image] = discoverGalleryImages({
      files: files(["2026-09/photo.png", "2026-09-10T00:00:00.000Z"]),
      metadata: metadata({
        path: "2026-09/photo.png",
        caption: "Tyre line",
        alt: "Rows of tyres on a production line",
      }),
    });

    expect(image.caption).toBe("Tyre line");
    expect(image.alt).toBe("Rows of tyres on a production line");
  });

  it("falls back to the caption for alt when only a caption is supplied", () => {
    const [image] = discoverGalleryImages({
      files: files(["2026-09/photo.png", "2026-09-10T00:00:00.000Z"]),
      metadata: metadata({ path: "2026-09/photo.png", caption: "Tyre line" }),
    });

    expect(image.caption).toBe("Tyre line");
    expect(image.alt).toBe("Tyre line");
  });

  it("treats a blank caption as absent", () => {
    const [image] = discoverGalleryImages({
      files: files(["2026-09/photo.png", "2026-09-10T00:00:00.000Z"]),
      metadata: metadata({ path: "2026-09/photo.png", caption: "   " }),
    });

    expect(image.caption).toBe(DEFAULT_GALLERY_CAPTION);
  });

  it("returns an empty set when nothing supported is present", () => {
    expect(discoverGalleryImages({ files: [] })).toEqual([]);
    expect(
      discoverGalleryImages({ files: files(["a.pdf", "2026-09-10T00:00:00.000Z"]) }),
    ).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";

import {
  discoverMachineImages,
  discoverStories,
  findStoryPoster,
  isMachineImage,
  isStoryPoster,
  isStoryVideo,
  type QualityFirstMetadata,
  type StorageFile,
} from "@/lib/media/quality-first";

function files(...paths: string[]): StorageFile[] {
  return paths.map((path) => ({ path }));
}

function metadata(
  ...entries: Array<Partial<QualityFirstMetadata> & { path: string }>
): QualityFirstMetadata[] {
  return entries.map((entry) => ({
    hidden: false,
    alt: null,
    caption: null,
    ...entry,
  }));
}

describe("supported file formats", () => {
  it("treats only .mp4 and .webm as stories", () => {
    expect(isStoryVideo("stories/clip-1.mp4")).toBe(true);
    expect(isStoryVideo("stories/clip-1.WEBM")).toBe(true);
    expect(isStoryVideo("stories/clip-1.mov")).toBe(false);
    expect(isStoryVideo("stories/clip-1.mkv")).toBe(false);
    expect(isStoryVideo("stories/notes.pdf")).toBe(false);
  });

  it("recognises image extensions as machine images and posters", () => {
    for (const path of [
      "2026-09/a.jpg",
      "2026-09/a.jpeg",
      "2026-09/a.png",
      "2026-09/a.webp",
      "2026-09/a.avif",
      "2026-09/a.gif",
    ]) {
      expect(isMachineImage(path)).toBe(true);
      expect(isStoryPoster(path)).toBe(true);
    }

    expect(isMachineImage("2026-09/a.svg")).toBe(false);
    expect(isMachineImage("2026-09/a.mp4")).toBe(false);
  });
});

describe("story discovery", () => {
  it("keeps only supported videos inside the stories folder", () => {
    const stories = discoverStories({
      files: files(
        "stories/clip-1.mp4",
        "stories/clip-2.webm",
        "stories/clip-3.mov",
        "stories/readme.txt",
        "2026-09/clip-4.mp4",
      ),
    });

    expect(stories.map((story) => story.path)).toEqual([
      "stories/clip-1.mp4",
      "stories/clip-2.webm",
    ]);
  });

  it("orders by natural filename, not lexically", () => {
    const stories = discoverStories({
      files: files(
        "stories/story-10.mp4",
        "stories/story-2.mp4",
        "stories/story-1.mp4",
      ),
    });

    expect(stories.map((story) => story.path)).toEqual([
      "stories/story-1.mp4",
      "stories/story-2.mp4",
      "stories/story-10.mp4",
    ]);
  });

  it("excludes hidden items without affecting the others", () => {
    const stories = discoverStories({
      files: files("stories/a.mp4", "stories/b.mp4", "stories/c.mp4"),
      metadata: metadata(
        { path: "stories/b.mp4", hidden: true },
        { path: "stories/c.mp4", caption: "Road test" },
      ),
    });

    expect(stories.map((story) => story.path)).toEqual([
      "stories/a.mp4",
      "stories/c.mp4",
    ]);
    expect(stories[1].title).toBe("Road test");
  });

  it("returns an empty set when there are no videos", () => {
    expect(discoverStories({ files: files("stories/poster.jpg") })).toEqual([]);
    expect(discoverStories({ files: [] })).toEqual([]);
  });
});

describe("story posters", () => {
  it("pairs a video with the sibling image sharing its stem", () => {
    const storyFiles = files(
      "stories/clip-1.mp4",
      "stories/clip-1.jpg",
      "stories/clip-2.mp4",
      "stories/clip-2.png",
    );

    expect(findStoryPoster("stories/clip-1.mp4", storyFiles)).toBe(
      "stories/clip-1.jpg",
    );
    expect(findStoryPoster("stories/clip-2.mp4", storyFiles)).toBe(
      "stories/clip-2.png",
    );
  });

  it("leaves the poster null when none is supplied", () => {
    expect(
      findStoryPoster("stories/clip-1.mp4", files("stories/clip-1.mp4")),
    ).toBeNull();

    const stories = discoverStories({ files: files("stories/clip-1.mp4") });
    expect(stories[0].posterPath).toBeNull();
  });

  it("only pairs a poster from the video's own folder", () => {
    expect(
      findStoryPoster(
        "stories/clip-1.mp4",
        files("stories/clip-1.mp4", "2026-09/clip-1.jpg"),
      ),
    ).toBeNull();
  });
});

describe("machine image discovery", () => {
  it("keeps only supported images, naturally ordered", () => {
    const images = discoverMachineImages({
      files: files(
        "2026-09/machine-10.jpg",
        "2026-09/machine-2.png",
        "2026-09/machine-1.webp",
        "2026-09/notes.pdf",
        "2026-09/clip.mp4",
      ),
    });

    expect(images.map((image) => image.path)).toEqual([
      "2026-09/machine-1.webp",
      "2026-09/machine-2.png",
      "2026-09/machine-10.jpg",
    ]);
  });

  it("excludes hidden machine images", () => {
    const images = discoverMachineImages({
      files: files("a.jpg", "b.jpg"),
      metadata: metadata({ path: "a.jpg", hidden: true }),
    });

    expect(images.map((image) => image.path)).toEqual(["b.jpg"]);
  });

  it("returns an empty set when nothing supported is present", () => {
    expect(discoverMachineImages({ files: files("a.pdf", "b.mp4") })).toEqual(
      [],
    );
  });
});

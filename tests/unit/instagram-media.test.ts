import { describe, expect, it } from "vitest";

import {
  altFromFilename,
  discoverInstagramImages,
  INSTAGRAM_ASSET_ROOT,
  INSTAGRAM_DISPLAY_COUNT,
  INSTAGRAM_ROTATE_MS,
  instagramImageUrl,
  isInstagramImage,
  nextInstagramDisplay,
  type InstagramImage,
} from "@/lib/media/instagram";
import { readInstagramImages } from "@/lib/media/instagram-assets";
import { naturalCompare } from "@/lib/natural-order";

function images(count: number): InstagramImage[] {
  return Array.from({ length: count }, (_, index) => ({
    url: `/assets/instagram/image-${index + 1}.jpg`,
    alt: `image ${index + 1}`,
  }));
}

const urls = (items: InstagramImage[]) => items.map((item) => item.url);

describe("supported image formats", () => {
  it("accepts the web image formats the folder ships", () => {
    for (const filename of ["a.webp", "a.jpg", "a.jpeg", "a.png", "A.JPEG"]) {
      expect(isInstagramImage(filename)).toBe(true);
    }
  });

  it("ignores unsupported or extensionless files", () => {
    for (const filename of ["a.svg", "a.gif", "a.mp4", "a.avif", "README"]) {
      expect(isInstagramImage(filename)).toBe(false);
    }
  });
});

describe("public image URLs", () => {
  it("serves from the local instagram asset folder", () => {
    expect(INSTAGRAM_ASSET_ROOT).toBe("/assets/instagram");
    expect(instagramImageUrl("image-1.jpg")).toBe(
      "/assets/instagram/image-1.jpg",
    );
  });

  it("percent-encodes spaces and ampersands in filenames", () => {
    expect(instagramImageUrl("Truck & Bus Tyres.jpg")).toBe(
      "/assets/instagram/Truck%20%26%20Bus%20Tyres.jpg",
    );
  });
});

describe("alt text from filenames", () => {
  it("humanises separators and drops the extension", () => {
    expect(altFromFilename("TR-1042.jpg")).toBe("TR 1042");
    expect(altFromFilename("Tractor_Front_Tyres.png")).toBe(
      "Tractor Front Tyres",
    );
  });

  it("strips stacked extensions", () => {
    expect(altFromFilename("agri-tr1095.jpg.jpeg")).toBe("agri tr1095");
  });
});

describe("folder discovery", () => {
  it("keeps supported images in natural filename order", () => {
    const discovered = discoverInstagramImages([
      "slide-10.jpg",
      "ignore.svg",
      "slide-2.jpg",
      "slide-1.webp",
    ]);

    expect(urls(discovered)).toEqual([
      instagramImageUrl("slide-1.webp"),
      instagramImageUrl("slide-2.jpg"),
      instagramImageUrl("slide-10.jpg"),
    ]);
  });

  it("carries a humanised alt for each image", () => {
    const [image] = discoverInstagramImages(["Grader Tyres.jpg"]);
    expect(image).toEqual({
      url: "/assets/instagram/Grader%20Tyres.jpg",
      alt: "Grader Tyres",
    });
  });

  it("returns an empty list when no supported images exist", () => {
    expect(discoverInstagramImages(["a.svg", "b.gif"])).toEqual([]);
    expect(discoverInstagramImages([])).toEqual([]);
  });
});

describe("display count and rotation cadence", () => {
  it("shows four images at a time, five minutes apart", () => {
    expect(INSTAGRAM_DISPLAY_COUNT).toBe(4);
    expect(INSTAGRAM_ROTATE_MS).toBe(300_000);
  });
});

describe("the displayed selection", () => {
  it("starts with the first four images in natural order", () => {
    expect(urls(nextInstagramDisplay(images(10), [], 0))).toEqual(
      urls(images(10).slice(0, 4)),
    );
  });

  it("shows only the available images when fewer than four exist", () => {
    expect(nextInstagramDisplay(images(2), [], 0)).toHaveLength(2);
    expect(nextInstagramDisplay(images(3), [], 5)).toHaveLength(3);
  });

  it("returns nothing when there are no images", () => {
    expect(nextInstagramDisplay([], [], 3)).toEqual([]);
  });

  it("falls back to the initial selection without a known current set", () => {
    expect(urls(nextInstagramDisplay(images(10), [], 3))).toEqual(
      urls(images(10).slice(0, 4)),
    );
  });

  it("replaces exactly one image in place, keeping the other three where they are", () => {
    const all = images(10);
    let current = nextInstagramDisplay(all, [], 0);

    for (let step = 1; step <= 12; step += 1) {
      const next = nextInstagramDisplay(all, current, step);

      expect(next).toHaveLength(INSTAGRAM_DISPLAY_COUNT);
      expect(new Set(urls(next)).size).toBe(INSTAGRAM_DISPLAY_COUNT);

      const changed = next.filter(
        (image, index) => image.url !== current[index].url,
      );
      expect(changed).toHaveLength(1);

      current = next;
    }
  });

  it("never runs out of images to rotate in", () => {
    const all = images(5);
    let current = nextInstagramDisplay(all, [], 0);

    for (let step = 1; step <= 25; step += 1) {
      const next = nextInstagramDisplay(all, current, step);
      expect(new Set(urls(next)).size).toBe(INSTAGRAM_DISPLAY_COUNT);
      current = next;
    }
  });

  it("stays static when there is no spare image to rotate in", () => {
    const all = images(INSTAGRAM_DISPLAY_COUNT);

    expect(urls(nextInstagramDisplay(all, [], 0))).toEqual(urls(all));
    expect(urls(nextInstagramDisplay(all, all, 1))).toEqual(urls(all));
    expect(urls(nextInstagramDisplay(all, all, 7))).toEqual(urls(all));
  });
});

describe("shipped developer assets", () => {
  it("discovers the local instagram images in natural order", () => {
    const discovered = readInstagramImages();

    expect(discovered.length).toBeGreaterThanOrEqual(INSTAGRAM_DISPLAY_COUNT);

    for (const image of discovered) {
      expect(image.url.startsWith(`${INSTAGRAM_ASSET_ROOT}/`)).toBe(true);
      const filename = decodeURIComponent(
        image.url.slice(`${INSTAGRAM_ASSET_ROOT}/`.length),
      );
      expect(isInstagramImage(filename)).toBe(true);
      expect(image.alt.length).toBeGreaterThan(0);
    }

    const filenames = discovered.map((image) =>
      decodeURIComponent(image.url.slice(`${INSTAGRAM_ASSET_ROOT}/`.length)),
    );
    expect(filenames).toEqual([...filenames].sort(naturalCompare));
  });
});

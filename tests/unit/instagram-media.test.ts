import { describe, expect, it } from "vitest";

import {
  altFromFilename,
  discoverInstagramImages,
  INSTAGRAM_ASSET_ROOT,
  INSTAGRAM_CAROUSEL_INTERVAL_MS,
  instagramImageUrl,
  isInstagramImage,
} from "@/lib/media/instagram";
import { readInstagramImages } from "@/lib/media/instagram-assets";
import { naturalCompare } from "@/lib/natural-order";

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

    expect(discovered.map((image) => image.url)).toEqual([
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

describe("carousel cadence", () => {
  it("advances every five seconds", () => {
    expect(INSTAGRAM_CAROUSEL_INTERVAL_MS).toBe(5_000);
  });
});

describe("shipped developer assets", () => {
  it("discovers the local instagram images in natural order", () => {
    const discovered = readInstagramImages();

    expect(discovered.length).toBeGreaterThan(1);

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

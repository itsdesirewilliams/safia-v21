import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { HeroVideo } from "@/components/home/hero-video";
import { InstagramStrip } from "@/components/home/instagram-strip";
import { YouTubeTour } from "@/components/home/youtube-tour";
import {
  INSTAGRAM_DISPLAY_COUNT,
  type InstagramImage,
} from "@/lib/media/instagram";

function images(count: number): InstagramImage[] {
  return Array.from({ length: count }, (_, index) => ({
    url: `/assets/instagram/image-${index + 1}.jpg`,
    alt: `image ${index + 1}`,
  }));
}

describe("Instagram strip", () => {
  it("shows four images at a time", () => {
    const html = renderToStaticMarkup(<InstagramStrip images={images(10)} />);

    expect(html.match(/<img /g)).toHaveLength(INSTAGRAM_DISPLAY_COUNT);
    expect(html.match(/alt="image [0-9]+"/g)).toHaveLength(
      INSTAGRAM_DISPLAY_COUNT,
    );
  });

  it("shows the available images when fewer than four exist", () => {
    const html = renderToStaticMarkup(<InstagramStrip images={images(2)} />);
    expect(html.match(/<img /g)).toHaveLength(2);
  });
});

describe("hero video", () => {
  it("renders a full-frame video without cropping", () => {
    const html = renderToStaticMarkup(
      <HeroVideo
        src="/media/hero-tour.mp4"
        poster="/media/hero-poster.svg"
        label="Safeway Tyre factory"
      />,
    );

    expect(html).toContain("<video");
    expect(html).toContain('src="/media/hero-tour.mp4"');
    expect(html).toContain('poster="/media/hero-poster.svg"');
    expect(html.toLowerCase()).toContain("playsinline");
    expect(html).toContain("loop");
    expect(html).toContain("w-full h-auto");
    expect(html).not.toContain("object-cover");
  });

  it("offers a control to unmute", () => {
    const html = renderToStaticMarkup(
      <HeroVideo
        src="/media/hero-tour.mp4"
        poster="/media/hero-poster.svg"
        label="Safeway Tyre factory"
      />,
    );

    expect(html).toContain('aria-label="Unmute video"');
  });
});

describe("YouTube tour", () => {
  it("renders the real YouTube player lazily, without forcing autoplay", () => {
    const html = renderToStaticMarkup(
      <YouTubeTour id="4jM2jUcc5Kc" title="Safeway Tyre factory tour" />,
    );

    expect(html).toContain("<iframe");
    expect(html).toContain(
      "https://www.youtube-nocookie.com/embed/4jM2jUcc5Kc",
    );
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('title="Safeway Tyre factory tour"');
    expect(html).not.toContain("autoplay=1");
  });
});

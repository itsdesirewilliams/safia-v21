import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MachineMasonry } from "@/components/quality-first/machine-masonry";
import { QualityFirstHero } from "@/components/quality-first/quality-first-hero";
import { StoryRail } from "@/components/quality-first/story-rail";
import { TestingExplanation } from "@/components/quality-first/testing-explanation";
import type {
  QualityFirstMachineImage,
  QualityFirstStory,
} from "@/lib/media/quality-first";

const STORIES: QualityFirstStory[] = [
  {
    path: "stories/story-1.mp4",
    url: "https://example.supabase.co/storage/v1/object/public/testing-videos/stories/story-1.mp4",
    posterUrl:
      "https://example.supabase.co/storage/v1/object/public/testing-videos/stories/story-1.jpg",
    title: "Endurance test",
    alt: null,
    caption: "Endurance test",
  },
  {
    path: "stories/story-2.webm",
    url: "https://example.supabase.co/storage/v1/object/public/testing-videos/stories/story-2.webm",
    posterUrl: null,
    title: null,
    alt: null,
    caption: null,
  },
];

const MACHINE_IMAGES: QualityFirstMachineImage[] = [
  {
    path: "2026-09/machine-1.jpg",
    url: "https://example.supabase.co/storage/v1/object/public/machine-images/2026-09/machine-1.jpg",
    alt: "A tyre on a tensile testing rig",
    caption: "Tensile rig",
  },
  {
    path: "2026-09/machine-2.jpg",
    url: "https://example.supabase.co/storage/v1/object/public/machine-images/2026-09/machine-2.jpg",
    alt: null,
    caption: null,
  },
];

describe("Quality First hero", () => {
  it("leads with the Quality First heading and in-page anchors", () => {
    const html = renderToStaticMarkup(<QualityFirstHero />);

    expect(html).toContain("Quality Is a Process, Not a Promise.");
    expect(html).toContain('href="#stories"');
    expect(html).toContain('href="#machines"');
    expect(html).toContain("<h1");
  });
});

describe("story rail", () => {
  it("shows a labelled empty state when there are no videos", () => {
    const html = renderToStaticMarkup(<StoryRail stories={[]} />);

    expect(html).toContain("Testing Videos Coming Soon");
    expect(html).not.toContain("Scroll stories left");
  });

  it("renders one playable card per story with a poster fallback", () => {
    const html = renderToStaticMarkup(<StoryRail stories={STORIES} />);

    expect(html.match(/aria-label="Play /g)).toHaveLength(2);
    expect(html).toContain("Endurance test");
    expect(html).toContain("Testing story 2");
    expect(html).toContain('aria-label="Scroll stories left"');
    expect(html).toContain('aria-label="Scroll stories right"');
    expect(html).toContain("snap-x");
  });
});

describe("machine masonry", () => {
  it("shows a labelled empty state when there are no images", () => {
    const html = renderToStaticMarkup(<MachineMasonry images={[]} />);

    expect(html).toContain("Machine Images Coming Soon");
  });

  it("renders a masonry column layout with natural-ratio images and captions", () => {
    const html = renderToStaticMarkup(
      <MachineMasonry images={MACHINE_IMAGES} />,
    );

    expect(html).toContain("columns-1");
    expect(html).toContain("sm:columns-2");
    expect(html).toContain("lg:columns-3");
    expect(html).toContain("break-inside-avoid");
    expect(html.match(/<img /g)).toHaveLength(2);
    expect(html).toContain("A tyre on a tensile testing rig");
    expect(html).toContain("Tensile rig");
    expect(html).not.toContain("object-cover");
  });
});

describe("testing explanation", () => {
  it("renders developer-owned headings and internal links", () => {
    const html = renderToStaticMarkup(<TestingExplanation />);

    expect(html).toContain("How Quality Is Built In");
    expect(html).toContain("A Discipline That Runs Through Production");
    expect(html).toContain("More Detail Coming Soon");
    expect(html).toContain('href="/products/truck-bus"');
    expect(html).toContain('href="/catalogue"');
    expect(html).toContain('href="/contact-us"');
    expect(html).toContain('href="/about-us"');
    expect(html).toContain('href="/warranty"');
  });
});

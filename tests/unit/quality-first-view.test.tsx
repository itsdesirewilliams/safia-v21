import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { QualityFirstHero } from "@/components/quality-first/quality-first-hero";
import { StoryRail } from "@/components/quality-first/story-rail";
import { TestingExplanation } from "@/components/quality-first/testing-explanation";
import type { QualityFirstStory } from "@/lib/media/quality-first";

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

describe("Quality First hero", () => {
  it("leads with the Quality First heading and has no calls to action", () => {
    const html = renderToStaticMarkup(<QualityFirstHero />);

    expect(html).toContain("Quality Is a Process, Not a Promise.");
    expect(html).toContain("<h1");
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("<button");
    expect(html).not.toContain('href="#stories"');
    expect(html).not.toContain('href="#machines"');
  });
});

describe("story rail", () => {
  it("shows a labelled empty state when there are no videos", () => {
    const html = renderToStaticMarkup(<StoryRail stories={[]} />);

    expect(html).toContain("Testing Videos Coming Soon");
    expect(html).not.toContain("Scroll stories left");
  });

  it("renders one playable card per story as a natural-ratio video", () => {
    const html = renderToStaticMarkup(<StoryRail stories={STORIES} />);

    expect(html.match(/aria-label="Play /g)).toHaveLength(2);
    expect(html.match(/<video /g)).toHaveLength(2);
    expect(html).toContain("Endurance test");
    expect(html).toContain("Testing story 2");
    expect(html).toContain('aria-label="Scroll stories left"');
    expect(html).toContain('aria-label="Scroll stories right"');
    expect(html).toContain("snap-x");
    // The card shows the video at its natural aspect ratio, never cropped.
    expect(html).toContain("h-auto w-full");
    expect(html).not.toContain("object-cover");
    expect(html).not.toContain("aspect-[9/16]");
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

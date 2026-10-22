// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { TestimonialCarousel } from "@/components/home/testimonial-carousel";
import { countryCode } from "@/lib/contact/countries";
import type { Testimonial } from "@/lib/homepage";

const MARKETS = [
  ["Chile", "Camila Rojas"],
  ["Peru", "Diego Quispe"],
  ["Egypt", "Mahmoud Fahmy"],
  ["Bolivia", "Carla Mendoza"],
  ["Kenya", "Joseph Otieno"],
  ["Tanzania", "Neema Mwakalinga"],
  ["Malawi", "Chiwande Banda"],
  ["Brazil", "Juan Carlos"],
  ["Czechia", "Milan Novak"],
  ["United Arab Emirates", "Aisha Rahman"],
] as const;

const TESTIMONIALS: Testimonial[] = MARKETS.map(([location, author]) => ({
  quote: `A remark about the tyres from ${location}.`,
  author,
  location,
  countryCode: countryCode(location),
  published: true,
}));

function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  act(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

function renderCarousel(testimonials: readonly Testimonial[] = TESTIMONIALS) {
  return render(
    <TestimonialCarousel
      testimonials={testimonials}
      label="Testimonials"
      previousLabel="Previous testimonial"
      nextLabel="Next testimonial"
    />,
  );
}

beforeEach(() => setViewport(1280));
afterEach(cleanup);

describe("testimonial carousel", () => {
  it("shows three cards side by side on the desktop", () => {
    renderCarousel();

    const cards = document.querySelectorAll("figure");
    expect(cards).toHaveLength(TESTIMONIALS.length);

    // Every card is one third of the visible row, so three are on screen.
    for (const card of cards) {
      expect(card.parentElement?.className).toContain("lg:w-1/3");
    }
  });

  it("shows one card at a time on a phone and two on a tablet", () => {
    renderCarousel();
    const wrapper = document.querySelector("figure")?.parentElement;

    expect(wrapper?.className).toContain("w-full");
    expect(wrapper?.className).toContain("sm:w-1/2");
  });

  it("keeps the author on one line and the flag beside the country on the next", () => {
    renderCarousel();
    const first = document.querySelector("figure");

    const author = first?.querySelector("figcaption p:first-child");
    const country = first?.querySelector("figcaption p:nth-child(2)");

    expect(author?.textContent).toBe("Camila Rojas");
    expect(country?.textContent).toContain("Chile");
    // A deterministic SVG flag keyed by the ISO code, never an emoji.
    expect(
      country?.querySelector('[data-country-flag="CL"]'),
    ).not.toBeNull();
  });

  it("never renders an emoji flag or unfinished wording", () => {
    renderCarousel();
    const html = document.body.innerHTML;

    expect(html).not.toMatch(/[\u{1F1E6}-\u{1F1FF}]{2}/u);
    expect(html).not.toMatch(/draft|placeholder|coming soon/i);
  });

  it("advances by one page and goes back again", () => {
    renderCarousel();

    const next = screen.getByRole("button", { name: "Next testimonial" });
    const previous = screen.getByRole("button", {
      name: "Previous testimonial",
    });

    expect(screen.getByTestId("testimonial-carousel-counter").textContent).toBe(
      "1 / 4",
    );

    fireEvent.click(next);
    expect(screen.getByTestId("testimonial-carousel-counter").textContent).toBe(
      "2 / 4",
    );

    fireEvent.click(previous);
    expect(screen.getByTestId("testimonial-carousel-counter").textContent).toBe(
      "1 / 4",
    );
  });

  it("disables the controls at each end of the collection", () => {
    renderCarousel();

    const previous = screen.getByRole("button", {
      name: "Previous testimonial",
    }) as HTMLButtonElement;
    const next = screen.getByRole("button", {
      name: "Next testimonial",
    }) as HTMLButtonElement;

    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(next);
    }
    expect(next.disabled).toBe(true);
    expect(previous.disabled).toBe(false);
  });

  it("moves with the arrow keys and with a swipe", () => {
    renderCarousel();
    const region = screen.getByRole("group", { name: "Testimonials" });

    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(screen.getByTestId("testimonial-carousel-counter").textContent).toBe(
      "2 / 4",
    );

    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(screen.getByTestId("testimonial-carousel-counter").textContent).toBe(
      "1 / 4",
    );

    // jsdom has no TouchEvent, so the touches are attached by hand. The
    // swipe lands on a card, exactly as it would for a visitor.
    const card = document.querySelector("figure") as HTMLElement;
    const touch = (type: string, clientX: number) => {
      const event = new Event(type, { bubbles: true });
      Object.defineProperty(event, "touches", { value: [{ clientX }] });
      Object.defineProperty(event, "changedTouches", { value: [{ clientX }] });
      card.dispatchEvent(event);
    };

    act(() => touch("touchstart", 240));
    act(() => touch("touchend", 120));
    expect(screen.getByTestId("testimonial-carousel-counter").textContent).toBe(
      "2 / 4",
    );
  });

  it("hides the controls when the whole collection already fits", () => {
    renderCarousel(TESTIMONIALS.slice(0, 3));

    expect(
      screen.queryByRole("button", { name: "Next testimonial" }),
    ).toBeNull();
    expect(
      screen.queryByTestId("testimonial-carousel-counter"),
    ).toBeNull();
  });

  it("recalculates the pages when the viewport changes", () => {
    renderCarousel();

    // Three per page on the desktop, four pages for ten entries.
    expect(screen.getByTestId("testimonial-carousel-counter").textContent).toBe(
      "1 / 4",
    );

    // One per page on a phone: ten pages.
    setViewport(420);
    expect(screen.getByTestId("testimonial-carousel-counter").textContent).toBe(
      "1 / 10",
    );

    // Two per page on a tablet: five pages.
    setViewport(800);
    expect(screen.getByTestId("testimonial-carousel-counter").textContent).toBe(
      "1 / 5",
    );
  });
});

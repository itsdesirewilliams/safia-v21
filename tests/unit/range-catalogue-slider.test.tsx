// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { RangeCatalogueSlider } from "@/components/catalogue/range-catalogue-slider";

afterEach(cleanup);

const SLIDES = [
  "/assets/catalogue/tbr/1_Im0.webp",
  "/assets/catalogue/tbr/2_Im0.webp",
  "/assets/catalogue/tbr/3_Im0.webp",
];

function renderSlider() {
  return render(<RangeCatalogueSlider slides={SLIDES} label="TBR Catalogue" />);
}

function counter() {
  return screen.getByTestId("range-catalogue-counter").textContent;
}

describe("range catalogue slider", () => {
  it("renders one image per catalogue page with page-specific alt text", () => {
    renderSlider();
    // Off-screen slides are aria-hidden, so include them explicitly.
    const images = screen.getAllByRole("img", { hidden: true });

    expect(images).toHaveLength(3);
    expect(images[0].getAttribute("alt")).toBe("TBR Catalogue — page 1 of 3");
    expect(images[2].getAttribute("alt")).toBe("TBR Catalogue — page 3 of 3");
  });

  it("never crops or stretches the artwork", () => {
    renderSlider();
    for (const image of screen.getAllByRole("img", { hidden: true })) {
      expect(image.className).not.toContain("object-cover");
      expect(image.className).toContain("h-auto");
      expect(image.className).toContain("w-full");
    }
  });

  it("starts on the first page with a position indicator", () => {
    renderSlider();
    expect(counter()).toBe("1 / 3");
  });

  it("advances and rewinds with the controls, disabling at the ends", async () => {
    const user = userEvent.setup();
    renderSlider();

    const prev = screen.getByRole("button", {
      name: "Previous catalogue page",
    }) as HTMLButtonElement;
    const next = screen.getByRole("button", {
      name: "Next catalogue page",
    }) as HTMLButtonElement;

    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    await user.click(next);
    expect(counter()).toBe("2 / 3");
    expect(prev.disabled).toBe(false);

    await user.click(next);
    expect(counter()).toBe("3 / 3");
    expect(next.disabled).toBe(true);

    await user.click(prev);
    expect(counter()).toBe("2 / 3");
  });

  it("supports left/right arrow keys when focused", async () => {
    const user = userEvent.setup();
    renderSlider();

    screen.getByRole("group").focus();

    await user.keyboard("{ArrowRight}");
    expect(counter()).toBe("2 / 3");

    await user.keyboard("{ArrowRight}");
    await user.keyboard("{ArrowRight}");
    expect(counter()).toBe("3 / 3");

    await user.keyboard("{ArrowLeft}");
    expect(counter()).toBe("2 / 3");
  });

  it("renders nothing when there are no pages", () => {
    const { container } = render(
      <RangeCatalogueSlider slides={[]} label="TBR Catalogue" />,
    );
    expect(container.firstChild).toBeNull();
  });
});

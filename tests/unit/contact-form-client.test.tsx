// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { QueryForm } from "@/components/contact/query-form";
import type { ContactFormState } from "@/lib/contact/form-state";

afterEach(() => {
  cleanup();
});

describe("inquiry form submit path", () => {
  it("invokes the server action with the current field values", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async (state: ContactFormState, formData: FormData) => {
      void state;
      void formData;
      return { status: "idle" as const };
    });

    render(<QueryForm defaultCountry="IN" action={action} />);

    await user.type(screen.getByLabelText(/Name/), "Deeeee");
    await user.type(screen.getByLabelText(/Phone/), "7986975391");
    await user.click(
      screen.getByRole("checkbox", { name: /Motorcycle Tyres/i }),
    );
    await user.type(
      screen.getByLabelText(/Message/),
      "This is a real test enquiry message.",
    );

    await user.click(screen.getByRole("button", { name: /Send Inquiry/i }));

    expect(action).toHaveBeenCalledTimes(1);
    const formData = action.mock.calls[0][1] as FormData;
    expect(formData.get("name")).toBe("Deeeee");
    expect(formData.get("country")).toBe("IN");
    expect(formData.get("phone")).toBe("7986975391");
    expect(formData.get("category")).toBe("motorcycle");
    expect(formData.get("message")).toBe("This is a real test enquiry message.");
  });

  it("clears a stale field error once the field is edited", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async () => ({
      status: "error" as const,
      errors: {
        message: "Tell us what you need, including sizes if applicable.",
      },
      values: {
        name: "Deeeee",
        country: "IN",
        phone: "7986975391",
        categories: ["motorcycle"],
        message: "testig",
      },
    }));

    render(<QueryForm defaultCountry="IN" action={action} />);

    await user.type(screen.getByLabelText(/Name/), "Deeeee");
    await user.type(screen.getByLabelText(/Phone/), "7986975391");
    await user.click(
      screen.getByRole("checkbox", { name: /Motorcycle Tyres/i }),
    );
    await user.type(screen.getByLabelText(/Message/), "testig");
    await user.click(screen.getByRole("button", { name: /Send Inquiry/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toMatch(
        /Tell us what you need/,
      ),
    );

    // Editing the field must remove the stale error immediately.
    await user.type(screen.getByLabelText(/Message/), " with more detail");
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });
});

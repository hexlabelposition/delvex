import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addDays, format, startOfToday } from "date-fns";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getEstimatedDelivery, toBusinessDay } from "@entities/shipment";
import { CreateShipmentForm } from "./create-shipment-form";

// The action module reaches the server-only API client, so it is replaced at
// its own path; the rest of the feature barrel stays real.
vi.mock("@features/shipment-form/api/action", () => ({
  createShipmentAction: vi.fn(),
  updateShipmentAction: vi.fn(),
}));

function memoryStorage() {
  const entries = new Map<string, string>();

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
    clear: () => entries.clear(),
    key: () => null,
    length: 0,
  };
}

function summaryCard(): HTMLElement {
  const card = screen.getByText("Summary").closest("div[data-slot=card]");

  if (card === null) {
    throw new Error("The summary card is missing");
  }

  return card as HTMLElement;
}

beforeEach(() => {
  vi.stubGlobal("localStorage", memoryStorage());
});

describe("CreateShipmentForm", () => {
  it("lays the form out in three sections next to a summary", () => {
    render(<CreateShipmentForm />);

    expect(
      screen.getByText(
        "Choose where Delvex picks the cargo up and drops it off.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Describe the goods and give their total weight."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Optional — the dates can be added or moved later."),
    ).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create shipment" }),
    ).toBeInTheDocument();
  });

  it("offers weight ranges instead of a free figure, and no time input", () => {
    render(<CreateShipmentForm />);

    expect(screen.getByText("Choose a weight range")).toBeInTheDocument();
    expect(screen.queryByLabelText(/time/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/Pick a pickup date and Delvex works out/),
    ).toBeInTheDocument();
  });

  it("works out the delivery date from the pickup date", async () => {
    render(<CreateShipmentForm />);

    await userEvent.click(screen.getByRole("button", { name: "Tomorrow" }));

    const pickup = toBusinessDay(addDays(startOfToday(), 1));
    const delivery = format(getEstimatedDelivery(pickup), "PPP");

    expect(
      screen.getByText(`Estimated delivery · ${delivery}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/business days after pickup, weekends excluded/),
    ).toBeInTheDocument();
  });

  it("restores a draft left behind earlier and can discard it", async () => {
    localStorage.setItem(
      "delvex:new-shipment-draft",
      JSON.stringify({
        originLocationId: "WROCLAW",
        destinationLocationId: "WARSAW",
        cargoDescription: "Documents",
        weightKg: "10",
        pickupAt: "",
      }),
    );

    render(<CreateShipmentForm />);

    expect(within(summaryCard()).getByText("Wrocław")).toBeInTheDocument();
    expect(within(summaryCard()).getByText("Documents")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Discard" }));

    // Discarding remounts the form, so the summary has to be looked up again.
    expect(within(summaryCard()).getAllByText("Not chosen yet")).toHaveLength(
      2,
    );
    expect(
      screen.queryByRole("button", { name: "Discard" }),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem("delvex:new-shipment-draft")).toBeNull();
  });

  it("swaps the pickup and delivery points", async () => {
    localStorage.setItem(
      "delvex:new-shipment-draft",
      JSON.stringify({
        originLocationId: "WROCLAW",
        destinationLocationId: "WARSAW",
        cargoDescription: "",
        weightKg: "",
        pickupAt: "",
      }),
    );

    render(<CreateShipmentForm />);

    expect(
      within(summaryCard()).getByText("From").parentElement,
    ).toHaveTextContent("Wrocław");

    await userEvent.click(
      screen.getByRole("button", { name: "Swap pickup and delivery points" }),
    );

    expect(
      within(summaryCard()).getByText("From").parentElement,
    ).toHaveTextContent("Warszawa");
    expect(
      within(summaryCard()).getByText("To").parentElement,
    ).toHaveTextContent("Wrocław");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Shipment, ShipmentStatus } from "@entities/shipment";
import { ShipmentDetailsView } from "./shipment-details-view";

vi.mock("@features/shipment-delete", () => ({
  DeleteShipmentButton: () => <button type="button">Delete</button>,
}));

function shipment(status: ShipmentStatus = "CREATED"): Shipment {
  return {
    id: "3f1a0a3e-0f6f-4f2e-8f5a-0f6f4f2e8f5a",
    referenceNumber: "DLX-ABC",
    status,
    originCountry: "PL",
    originCity: "Wrocław",
    originPostalCode: "50-001",
    originAddress: "Rynek 1",
    destinationCountry: "PL",
    destinationCity: "Warszawa",
    destinationPostalCode: "00-001",
    destinationAddress: "Marszałkowska 1",
    cargoDescription: "Two pallets of books",
    weightKg: 120.5,
    pickupAt: null,
    deliveryAt: "2026-09-02T08:30:00Z",
    version: 0,
    createdAt: "2026-08-30T10:00:00Z",
    updatedAt: "2026-08-30T10:00:00Z",
  };
}

describe("ShipmentDetailsView", () => {
  it("shows the route, cargo and schedule", () => {
    render(<ShipmentDetailsView shipment={shipment()} />);

    expect(screen.getByText("Rynek 1")).toBeInTheDocument();
    expect(screen.getByText("Marszałkowska 1")).toBeInTheDocument();
    expect(screen.getByText("Two pallets of books")).toBeInTheDocument();
    expect(screen.getByText("120.5 kg")).toBeInTheDocument();
    expect(screen.getByText("Not scheduled")).toBeInTheDocument();
  });

  it("offers editing and deleting only while the shipment is created", () => {
    const { unmount } = render(<ShipmentDetailsView shipment={shipment()} />);

    expect(screen.getByRole("link", { name: /Edit/ })).toHaveAttribute(
      "href",
      "/shipments/3f1a0a3e-0f6f-4f2e-8f5a-0f6f4f2e8f5a/edit",
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();

    unmount();
    render(<ShipmentDetailsView shipment={shipment("IN_TRANSIT")} />);

    expect(
      screen.queryByRole("link", { name: /Edit/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  it("marks the current step of the delivery flow", () => {
    render(<ShipmentDetailsView shipment={shipment("IN_TRANSIT")} />);

    const current = screen.getByRole("listitem", { current: "step" });

    expect(current).toHaveTextContent("In transit");
  });

  it("replaces the flow with a cancelled state", () => {
    render(<ShipmentDetailsView shipment={shipment("CANCELLED")} />);

    expect(screen.getByText(/This shipment was cancelled/)).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});

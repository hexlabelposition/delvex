import { render, screen } from "@testing-library/react";
import type * as shipmentFormSchema from "@features/shipment-form/model/schema";
import { describe, expect, it, vi } from "vitest";
import type { Shipment, ShipmentStatus } from "@entities/shipment";
import { ShipmentEditView } from "./shipment-edit-view";

vi.mock("@features/shipment-form", async () => {
  const actual = await vi.importActual<typeof shipmentFormSchema>(
    "@features/shipment-form/model/schema",
  );

  return {
    ...actual,
    UpdateShipmentForm: ({ shipmentId }: { shipmentId: string }) => (
      <form aria-label={`Edit ${shipmentId}`} />
    ),
  };
});

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
    cargoDescription: "Documents",
    weightKg: 10,
    pickupAt: null,
    deliveryAt: null,
    version: 0,
    createdAt: "2026-08-30T10:00:00Z",
    updatedAt: "2026-08-30T10:00:00Z",
  };
}

describe("ShipmentEditView", () => {
  it("renders the form while the shipment is still created", () => {
    render(<ShipmentEditView shipment={shipment()} />);

    expect(
      screen.getByRole("form", {
        name: "Edit 3f1a0a3e-0f6f-4f2e-8f5a-0f6f4f2e8f5a",
      }),
    ).toBeInTheDocument();
  });

  it("explains why a moving shipment cannot be edited", () => {
    render(<ShipmentEditView shipment={shipment("IN_TRANSIT")} />);

    expect(screen.getByText("Editing is closed")).toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View shipment/ })).toHaveAttribute(
      "href",
      "/shipments/3f1a0a3e-0f6f-4f2e-8f5a-0f6f4f2e8f5a",
    );
  });
});

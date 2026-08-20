import type { EmployeeShipment } from "@shared/api";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("@features/shipment-status", () => ({
  ShipmentStatusControls: ({
    allowedStatuses,
  }: EmployeeShipment["shipment"] & {
    allowedStatuses?: string[];
  }) => <span>{allowedStatuses?.join(",")}</span>,
}));

import { EmployeeShipmentsTable } from "./employee-shipments-table";

const record: EmployeeShipment = {
  shipment: {
    id: "shipment-id",
    referenceNumber: "DLX-100",
    status: "CREATED",
    originCountry: "PL",
    originCity: "Warszawa",
    originPostalCode: "00-001",
    originAddress: "Main 1",
    destinationCountry: "PL",
    destinationCity: "Gdańsk",
    destinationPostalCode: "80-001",
    destinationAddress: "Port 1",
    cargoDescription: "Books",
    weightKg: 1,
    pickupAt: null,
    deliveryAt: null,
    version: 0,
    createdAt: "2026-08-20T10:00:00Z",
    updatedAt: "2026-08-20T10:00:00Z",
  },
  customer: {
    id: "customer-id",
    email: "customer@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
  },
  originBranch: {
    id: "origin-id",
    code: "WARSAW",
    name: "Warsaw Central",
    country: "PL",
    city: "Warszawa",
    postalCode: "00-001",
    address: "Main 1",
  },
  destinationBranch: {
    id: "destination-id",
    code: "GDANSK",
    name: "Gdansk Central",
    country: "PL",
    city: "Gdańsk",
    postalCode: "80-001",
    address: "Port 1",
  },
  currentBranch: null,
  allowedStatuses: ["ACCEPTED_AT_ORIGIN", "CANCELLED"],
};

describe("EmployeeShipmentsTable", () => {
  it("renders branch context, permitted actions, and keyboard navigation", () => {
    render(<EmployeeShipmentsTable shipments={[record]} />);

    const row = screen.getByText("DLX-100").closest("tr")!;

    expect(row).toHaveTextContent("WARSAW");
    expect(row).toHaveTextContent("GDANSK");
    expect(screen.getByText("Origin · WARSAW")).toBeInTheDocument();
    expect(
      screen.getByText("ACCEPTED_AT_ORIGIN,CANCELLED"),
    ).toBeInTheDocument();

    fireEvent.keyDown(row, { key: "Enter" });
    expect(mocks.push).toHaveBeenCalledWith("/employee/shipments/shipment-id");
  });
});

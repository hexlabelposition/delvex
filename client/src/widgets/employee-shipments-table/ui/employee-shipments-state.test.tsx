import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmployeeShipmentsState } from "./employee-shipments-state";

describe("EmployeeShipmentsState", () => {
  it("shows a branch queue error", () => {
    render(
      <EmployeeShipmentsState error hasShipments={false}>
        shipments
      </EmployeeShipmentsState>,
    );

    expect(screen.getByText("Couldn’t load shipments")).toBeInTheDocument();
    expect(screen.getByText(/branch queue is unavailable/i)).toBeInTheDocument();
  });

  it("shows the scanner-oriented empty state", () => {
    render(
      <EmployeeShipmentsState error={false} hasShipments={false}>
        shipments
      </EmployeeShipmentsState>,
    );

    expect(screen.getByText("No matching shipments")).toBeInTheDocument();
    expect(screen.getByText(/scan another reference/i)).toBeInTheDocument();
  });

  it("renders results when shipments are available", () => {
    render(
      <EmployeeShipmentsState error={false} hasShipments>
        <p>shipment results</p>
      </EmployeeShipmentsState>,
    );

    expect(screen.getByText("shipment results")).toBeInTheDocument();
  });
});

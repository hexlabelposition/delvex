import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmployeeShipmentsState } from "./employee-shipments-state";

describe("EmployeeShipmentsState", () => {
  it("shows a useful loading error", () => {
    render(
      <EmployeeShipmentsState error loading={false} hasShipments={false}>
        shipments
      </EmployeeShipmentsState>,
    );
    expect(screen.getByText("Couldn’t load shipments")).toBeInTheDocument();
    expect(screen.getByText(/server is unavailable/i)).toBeInTheDocument();
  });

  it("shows the empty state when filters have no matches", () => {
    render(
      <EmployeeShipmentsState
        error={false}
        loading={false}
        hasShipments={false}
      >
        shipments
      </EmployeeShipmentsState>,
    );
    expect(screen.getByText("No matching shipments")).toBeInTheDocument();
  });

  it("renders results when shipments are available", () => {
    render(
      <EmployeeShipmentsState error={false} loading={false} hasShipments>
        <p>shipment results</p>
      </EmployeeShipmentsState>,
    );
    expect(screen.getByText("shipment results")).toBeInTheDocument();
  });
});

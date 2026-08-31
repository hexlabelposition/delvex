import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ShipmentFormValues } from "@features/shipment-form";
import { ShipmentSummary } from "./shipment-summary";

const empty: ShipmentFormValues = {
  originLocationId: "",
  destinationLocationId: "",
  cargoDescription: "",
  weightKg: "",
  pickupAt: "",
};

describe("ShipmentSummary", () => {
  it("shows placeholders while the form is empty", () => {
    render(<ShipmentSummary values={empty} />);

    expect(screen.getAllByText("Not chosen yet")).toHaveLength(2);
    expect(screen.getByText("No cargo description yet")).toBeInTheDocument();
    expect(screen.getByText("No weight yet")).toBeInTheDocument();
    expect(screen.getByText("Not scheduled")).toBeInTheDocument();
  });

  it("reflects what has been filled in", () => {
    render(
      <ShipmentSummary
        values={{
          ...empty,
          originLocationId: "WROCLAW",
          destinationLocationId: "WARSAW",
          cargoDescription: "Two pallets of books",
          weightKg: "20",
        }}
      />,
    );

    expect(screen.getByText("Wrocław")).toBeInTheDocument();
    expect(screen.getByText("Warszawa")).toBeInTheDocument();
    expect(screen.getByText("Two pallets of books")).toBeInTheDocument();
    expect(screen.getByText("10–20 kg")).toBeInTheDocument();
    expect(screen.getByText("Not scheduled")).toBeInTheDocument();
  });

  it("marks the schedule as optional", () => {
    render(<ShipmentSummary values={empty} />);

    expect(screen.getByText("optional")).toBeInTheDocument();
  });

  it("pairs the pickup date with the delivery Delvex works out", () => {
    // Wednesday 2 Sep 2026 plus five business days is Wednesday 9 Sep.
    render(<ShipmentSummary values={{ ...empty, pickupAt: "2026-09-02" }} />);

    expect(screen.getByText("Sep 2, 2026 → Sep 9, 2026")).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import {
  getShipmentStatusStep,
  isShipmentDeletable,
  isShipmentEditable,
  SHIPMENT_STATUS_FLOW,
} from "./status";

describe("getShipmentStatusStep", () => {
  it("returns the position in the delivery flow", () => {
    expect(getShipmentStatusStep("CREATED")).toBe(0);
    expect(getShipmentStatusStep("IN_TRANSIT")).toBe(2);
    expect(getShipmentStatusStep("DELIVERED")).toBe(
      SHIPMENT_STATUS_FLOW.length - 1,
    );
  });

  it("places a cancelled shipment outside the flow", () => {
    expect(getShipmentStatusStep("CANCELLED")).toBe(-1);
  });
});

describe("shipment permissions", () => {
  it("only allows editing and deleting before the shipment moves", () => {
    expect(isShipmentEditable("CREATED")).toBe(true);
    expect(isShipmentDeletable("CREATED")).toBe(true);

    for (const status of [
      "ACCEPTED_AT_ORIGIN",
      "IN_TRANSIT",
      "ARRIVED_AT_DESTINATION",
      "DELIVERED",
      "CANCELLED",
    ] as const) {
      expect(isShipmentEditable(status)).toBe(false);
      expect(isShipmentDeletable(status)).toBe(false);
    }
  });
});

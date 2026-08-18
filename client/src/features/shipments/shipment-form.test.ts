import { describe, expect, it } from "vitest";

import {
  shipmentFormErrors,
  shipmentFormSchema,
} from "@/features/shipments/shipment-form";

const validValues = {
  originLocationId: "WROCLAW",
  destinationLocationId: "WARSAW",
  cargoDescription: "Documents",
  weightKg: "1.25",
  pickupAt: "2026-08-18T10:00",
  deliveryAt: "2026-08-19T10:00",
};

describe("shipmentFormSchema", () => {
  it("normalizes valid form values", () => {
    expect(shipmentFormSchema.parse(validValues)).toMatchObject({
      cargoDescription: "Documents",
      weightKg: 1.25,
    });
  });

  it("rejects an invalid weight and reversed schedule", () => {
    const errors = shipmentFormErrors({
      ...validValues,
      weightKg: "0",
      deliveryAt: "2026-08-17T10:00",
    });

    expect(errors.weightKg).toBe("Weight must be at least 0.01 kg");
    expect(errors.deliveryAt).toBe("Delivery cannot be earlier than pickup");
  });

  it("returns only errors for the requested step", () => {
    const errors = shipmentFormErrors(
      { ...validValues, originLocationId: "", weightKg: "0" },
      ["originLocationId"],
    );
    expect(errors).toHaveProperty("originLocationId");
    expect(errors).not.toHaveProperty("weightKg");
  });
});

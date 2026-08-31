import { describe, expect, it } from "vitest";
import type { Shipment } from "@entities/shipment";
import { ShipmentFormSchema, shipmentToFormValues } from "./schema";

const validValues = {
  originLocationId: "WROCLAW",
  destinationLocationId: "WARSAW",
  cargoDescription: "Documents",
  weightKg: "20",
  pickupAt: "2026-09-02",
};

function errorsFor(values: Record<string, string>) {
  const result = ShipmentFormSchema.safeParse(values);

  if (result.success) {
    return {} as Record<string, string>;
  }

  return Object.fromEntries(
    result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
  );
}

describe("ShipmentFormSchema", () => {
  it("parses the string form values into the API payload shape", () => {
    expect(ShipmentFormSchema.parse(validValues)).toMatchObject({
      originLocationId: "WROCLAW",
      cargoDescription: "Documents",
      weightKg: 20,
      pickupAt: "2026-09-02",
    });
  });

  it("accepts a shipment that is not scheduled yet", () => {
    expect(
      ShipmentFormSchema.safeParse({ ...validValues, pickupAt: "" }).success,
    ).toBe(true);
  });

  it("only accepts one of the weight ranges", () => {
    expect(errorsFor({ ...validValues, weightKg: "17" }).weightKg).toBe(
      "Choose a weight range",
    );
  });

  it("rejects a pickup that carries a time", () => {
    expect(
      errorsFor({ ...validValues, pickupAt: "2026-09-02T10:00" }).pickupAt,
    ).toBe("Pick a date");
  });

  it("rejects an unknown Delvex point", () => {
    expect(
      errorsFor({ ...validValues, originLocationId: "BERLIN" })
        .originLocationId,
    ).toBe("Choose a Delvex point");
  });
});

describe("shipmentToFormValues", () => {
  it("maps a shipment onto the catalogue, its weight band, and a plain date", () => {
    const values = shipmentToFormValues({
      originCity: "Wrocław",
      destinationCity: "Warszawa",
      cargoDescription: "Documents",
      weightKg: 12.5,
      pickupAt: "2026-09-02T10:00:00Z",
      deliveryAt: null,
    } as Shipment);

    expect(values).toMatchObject({
      originLocationId: "WROCLAW",
      destinationLocationId: "WARSAW",
      weightKg: "20",
      pickupAt: "2026-09-02",
    });
  });

  it("leaves the pickup empty for an unscheduled shipment", () => {
    const values = shipmentToFormValues({
      originCity: "Wrocław",
      destinationCity: "Warszawa",
      cargoDescription: "Documents",
      weightKg: 5,
      pickupAt: null,
      deliveryAt: null,
    } as Shipment);

    expect(values.pickupAt).toBe("");
    expect(values.weightKg).toBe("10");
  });
});

import { describe, expect, it } from "vitest";
import { shipmentWeightLabel } from "../lib/format";
import { getShipmentWeightValue } from "./weight";

describe("shipmentWeightLabel", () => {
  it("names the band a stored weight belongs to", () => {
    expect(shipmentWeightLabel(10)).toBe("Up to 10 kg");
    expect(shipmentWeightLabel(20)).toBe("10–20 kg");
    expect(shipmentWeightLabel(50)).toBe("20–50 kg");
  });

  it("keeps the figure for weights booked before the bands existed", () => {
    expect(shipmentWeightLabel(120.5)).toBe("120.5 kg");
  });
});

describe("getShipmentWeightValue", () => {
  it("puts a stored weight back into its band", () => {
    expect(getShipmentWeightValue(4)).toBe("10");
    expect(getShipmentWeightValue(10)).toBe("10");
    expect(getShipmentWeightValue(11)).toBe("20");
    expect(getShipmentWeightValue(50)).toBe("50");
  });

  it("leaves the field empty when nothing fits", () => {
    expect(getShipmentWeightValue(120)).toBe("");
  });
});

import { describe, expect, it } from "vitest";
import type { Shipment, ShipmentStatus } from "@entities/shipment";
import { getDashboardStats } from "./stats";

function shipment(status: ShipmentStatus) {
  return { status } as Shipment;
}

describe("getDashboardStats", () => {
  it("groups every status into its tile", () => {
    const stats = getDashboardStats(
      [
        shipment("CREATED"),
        shipment("ACCEPTED_AT_ORIGIN"),
        shipment("IN_TRANSIT"),
        shipment("ARRIVED_AT_DESTINATION"),
        shipment("DELIVERED"),
        shipment("CANCELLED"),
      ],
      6,
    );

    expect(stats).toEqual({
      total: 6,
      awaitingPickup: 1,
      inTransit: 3,
      delivered: 1,
      cancelled: 1,
      sampled: false,
      sampleSize: 6,
    });
  });

  it("marks the counts as sampled when the page does not cover every shipment", () => {
    const stats = getDashboardStats([shipment("DELIVERED")], 120);

    expect(stats.total).toBe(120);
    expect(stats.sampled).toBe(true);
    expect(stats.sampleSize).toBe(1);
  });
});

import type { Shipment } from "../model/schema";

export interface ShipmentStatusCounts {
  awaitingPickup: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
}

/**
 * Groups shipments into the four buckets both the dashboard and the shipments
 * page show. The API has no aggregation endpoint, so counting always happens
 * over whatever page of shipments the caller has at hand.
 */
export function countShipmentsByStatus(
  shipments: Shipment[],
): ShipmentStatusCounts {
  const counts: ShipmentStatusCounts = {
    awaitingPickup: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const { status } of shipments) {
    switch (status) {
      case "CREATED":
        counts.awaitingPickup += 1;
        break;
      case "ACCEPTED_AT_ORIGIN":
      case "IN_TRANSIT":
      case "ARRIVED_AT_DESTINATION":
        counts.inTransit += 1;
        break;
      case "DELIVERED":
        counts.delivered += 1;
        break;
      case "CANCELLED":
        counts.cancelled += 1;
        break;
    }
  }

  return counts;
}

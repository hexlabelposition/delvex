import { countShipmentsByStatus, type Shipment } from "@entities/shipment";

export const RECENT_SHIPMENTS_LIMIT = 10;

export interface DashboardStats {
  total: number;
  awaitingPickup: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  /** True when the counts are derived from a subset of all shipments. */
  sampled: boolean;
  sampleSize: number;
}

export function getDashboardStats(
  shipments: Shipment[],
  totalShipments: number,
): DashboardStats {
  return {
    ...countShipmentsByStatus(shipments),
    total: totalShipments,
    sampled: shipments.length < totalShipments,
    sampleSize: shipments.length,
  };
}
